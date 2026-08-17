---
title: "Monitoring"
linkTitle: "Monitoring"
weight: 30
description: >
  Each Spinnaker microservice is instrumented with numerous metrics exposed via a built in endpoint.
---

Each Spinnaker microservice is instrumented with numerous metrics exposed
via a built in endpoint. The recommended approach for monitoring Spinnaker
is to attach the [OpenTelemetry (OTEL) Java agent](https://opentelemetry.io/docs/zero-code/java/agent/)
to each microservice via a Kubernetes init container, send telemetry to an
[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/), and
configure that collector to forward data to your preferred monitoring backend.

> **Note on the Spinnaker Observability Plugin**: The Armory Observability Plugin
> (`armory-plugins/armory-observability-plugin`) was previously recommended but is
> no longer actively developed. New deployments should use the OTEL Java agent
> approach described on this page.

This approach provides:

- **Standard JVM metrics** (heap, GC, thread pools) auto-instrumented with no code changes
- **Spinnaker application metrics** via the agent's built-in Micrometer extraction — no scraping required
- **Distributed tracing** across Spinnaker microservices
- **Vendor-neutral pipeline**: route the same telemetry to Prometheus, Datadog,
  New Relic, Grafana Cloud, or any OTLP-compatible backend by changing only
  the collector config


## Architecture Overview

```
Spinnaker microservices
  (OTEL Java agent injected via init container)
        │
        │ OTLP (gRPC or HTTP)
        ▼
  OpenTelemetry Collector
        │
        ├──▶ Prometheus (remote write or scrape)
        ├──▶ Datadog
        ├──▶ New Relic
        └──▶ Any OTLP-compatible backend
```

The OTEL Java agent includes built-in support for extracting
[Micrometer](https://micrometer.io/) metrics from the JVM. Enabling this
instrumentation causes the agent to collect Spinnaker's internal application
metrics and emit them via OTLP alongside standard JVM and HTTP metrics — no
separate Prometheus scrape of `/spectator/metrics` is required.


## Step 1: Add the OTEL Agent as a Kustomize Component

The recommended way to inject the OTEL agent is as a
[Kustomize component](https://github.com/spinnaker/spinnaker/tree/main/spinnaker-kustomize)
that patches each service deployment to add an init container, a shared volume,
and the required environment variables. This requires no changes to the base
service images.

Create `components/otel-agent/kustomization.yml` in your spinnaker-kustomize
directory:

```yaml
apiVersion: kustomize.config.k8s.io/v1alpha1
kind: Component

patches:
- patch: |-
    - op: add
      path: /spec/template/spec/initContainers
      value:
        - name: otel-agent-init
          image: otel/autoinstrumentation-java:2.27.0
          command: ["cp", "/javaagent.jar", "/otel/opentelemetry-javaagent.jar"]
          volumeMounts:
            - name: otel-agent
              mountPath: /otel
    - op: add
      path: /spec/template/spec/volumes/-
      value:
        name: otel-agent
        emptyDir: {}
    - op: add
      path: /spec/template/spec/containers/0/volumeMounts/-
      value:
        name: otel-agent
        mountPath: /otel
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: JAVA_TOOL_OPTIONS
        value: "-javaagent:/otel/opentelemetry-javaagent.jar"
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_EXPORTER_OTLP_ENDPOINT
        value: "http://otel-collector:4317"
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_EXPORTER_OTLP_PROTOCOL
        value: grpc
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_METRICS_EXPORTER
        value: otlp
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_TRACES_EXPORTER
        value: otlp
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_LOGS_EXPORTER
        value: none
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: OTEL_INSTRUMENTATION_MICROMETER_ENABLED
        value: "true"
  target:
    group: apps
    version: v1
    kind: Deployment
    labelSelector: "app.kubernetes.io/part-of=spinnaker"
```

The `OTEL_INSTRUMENTATION_MICROMETER_ENABLED=true` flag activates the agent's
built-in Micrometer instrumentation, which reads Spinnaker's internal metrics
at the JVM level and emits them via OTLP. No additional Spring or application
config is needed.

> **Service names**: By default the agent uses the Deployment name as
> `service.name`. To set it explicitly per service, add individual per-deployment
> patches that set `OTEL_SERVICE_NAME` (e.g. `clouddriver`, `orca`, `gate`).

Enable the component in your root `kustomization.yml`:

```yaml
components:
- components/otel-agent
# ... other components
```

Then apply as usual:

```bash
kubectl kustomize -o spinnaker.yml
kubectl apply -f spinnaker.yml
```


## Step 2: Deploy the OpenTelemetry Collector

The OTEL Collector is the central hub that receives telemetry from the agents
and routes it to your backend(s). Deploy it as a standalone Deployment or
DaemonSet depending on your scale.

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-collector
  namespace: spinnaker
spec:
  replicas: 1
  selector:
    matchLabels:
      app: otel-collector
  template:
    metadata:
      labels:
        app: otel-collector
    spec:
      containers:
        - name: otel-collector
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/conf/otel-collector-config.yaml"]
          ports:
            - containerPort: 4317  # OTLP gRPC
            - containerPort: 4318  # OTLP HTTP
            - containerPort: 8888  # Collector self-metrics
          volumeMounts:
            - name: otel-collector-config
              mountPath: /conf
      volumes:
        - name: otel-collector-config
          configMap:
            name: otel-collector-config
---
apiVersion: v1
kind: Service
metadata:
  name: otel-collector
  namespace: spinnaker
spec:
  selector:
    app: otel-collector
  ports:
    - name: otlp-grpc
      port: 4317
      targetPort: 4317
    - name: otlp-http
      port: 4318
      targetPort: 4318
```

### Collector Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: otel-collector-config
  namespace: spinnaker
data:
  otel-collector-config.yaml: |
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
          http:
            endpoint: 0.0.0.0:4318

    processors:
      batch:
        timeout: 10s
      memory_limiter:
        check_interval: 1s
        limit_mib: 512

    exporters:
      # Replace with your chosen backend — see Step 4
      prometheusremotewrite:
        endpoint: "http://prometheus:9090/api/v1/write"

    service:
      pipelines:
        metrics:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [prometheusremotewrite]
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [prometheusremotewrite]
```


## Step 3: Configure a Backend

Replace the `exporters` section of the collector config with one of the
following. You can fan out to multiple backends simultaneously by listing
them all and referencing each in the pipeline.

### Prometheus

Run Prometheus with the remote write receiver enabled
(`--web.enable-remote-write-receiver`), then use:

```yaml
exporters:
  prometheusremotewrite:
    endpoint: "http://prometheus:9090/api/v1/write"
```

Or expose a scrape endpoint from the collector itself:

```yaml
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
```

### Datadog

```yaml
exporters:
  datadog:
    api:
      key: "${DD_API_KEY}"
      site: datadoghq.com   # or datadoghq.eu
```

Requires the `otel/opentelemetry-collector-contrib` image.

### New Relic

```yaml
exporters:
  otlp:
    endpoint: "https://otlp.nr-data.net:4317"
    headers:
      api-key: "${NEW_RELIC_LICENSE_KEY}"
```

### Grafana Cloud (OTLP)

```yaml
exporters:
  otlp:
    endpoint: "https://otlp-gateway-<region>.grafana.net/otlp"
    headers:
      authorization: "Basic ${GRAFANA_OTLP_TOKEN}"
```


## Consuming Metrics

### Spinnaker Application Metrics (Micrometer)

Spinnaker publishes internal metrics using a multi-dimensional data model
based on "tags". Each metric has a name and type; each data point is a
numeric value time-stamped at the time of reporting and tagged with a set
of one or more `label=value` pairs.

With `OTEL_INSTRUMENTATION_MICROMETER_ENABLED=true`, the OTEL agent reads
these metrics directly from the JVM's Micrometer registry and emits them via
OTLP. See the [Monitoring Reference](/docs/reference/monitoring/) for a full
description of available metrics, tags, and the data model.

### Types of Metrics

- **Counters** are monotonically increasing values over the lifetime of
  the process. Use counter differences over a time window to compute rates.
  Spinnaker also uses a special **Timer** counter type (always in nanoseconds)
  that emits complementary `__count` and `__totalTime` series. Divide
  `totalTime` by `count` to get average latency.

- **Gauges** are instantaneous value readings. Useful for queue sizes,
  active connections, and similar current-state measurements.

### Standard JVM Metrics (from OTEL agent)

The OTEL Java agent automatically emits:

- `jvm.memory.used` / `jvm.memory.committed` — heap and non-heap usage
- `jvm.gc.duration` — GC pause times
- `jvm.thread.count` — live threads
- `http.server.request.duration` — latency histogram for all HTTP endpoints
- `http.client.request.duration` — latency for outbound HTTP calls

These use [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/)
and are available in any backend without additional configuration.


## Dashboards

The [spinnaker-mixin](https://github.com/uneeq-oss/spinnaker-mixin) project
provides pre-built Grafana dashboards that work with Prometheus-backed
Spinnaker metrics. You can import these as a starting point and extend them
with the standard JVM metrics produced by the OTEL agent.

The dashboards include:

- **Per-microservice dashboards** — API success/error counts, latency by
  controller and method, service-specific operational metrics
- **Cloud provider dashboards** — Spinnaker's interaction with each configured
  cloud provider (success rates, latency, resource operations)
- **Minimal Spinnaker** — a concise overview for quick health assessment
