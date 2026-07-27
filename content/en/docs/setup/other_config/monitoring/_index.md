---
title: "Monitoring"
linkTitle: "Monitoring"
weight: 30
description: >
  Each Spinnaker microservice is instrumented with numerous metrics exposed via a built in endpoint.
---

Each Spinnaker microservice is instrumented with numerous metrics, published
through an internal Spectator API that wraps a Micrometer `MeterRegistry` and
exposed on a built-in `/spectator/metrics` endpoint. You can scrape that
endpoint yourself, or collect metrics and traces with
[OpenTelemetry (OTEL)](#opentelemetry-recommended), which is the recommended
approach.

The metrics use a multi-dimensional, tag-based data model, described in
[Consuming metrics](#consuming-metrics) and the
[Monitoring reference](/docs/reference/monitoring/).

## OpenTelemetry (Recommended)

Attach the [OpenTelemetry Java auto-instrumentation agent](https://opentelemetry.io/docs/zero-code/java/agent/)
to each Spinnaker JVM process. The agent exports telemetry over OTLP, either to
an [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) or
directly to any OTLP-compatible vendor endpoint. A collector is the more
flexible option, since it lets you send the same data to more than one backend.

### Why this works with Spinnaker

Spinnaker registers its metrics as Micrometer meters on each service's
`MeterRegistry` (exposed externally through the Spectator API and
`/spectator/metrics`). The OTEL Java agent includes optional Micrometer
instrumentation that exports Micrometer meters through the OpenTelemetry
metrics SDK over OTLP, so no Spinnaker code changes are required.

The Micrometer bridge is **disabled by default** in OTEL Java agent 2.0.0 and
later. Enable it with `OTEL_INSTRUMENTATION_MICROMETER_ENABLED=true` (or
`-Dotel.instrumentation.micrometer.enabled=true`). Without it the agent still
provides auto-instrumented traces (HTTP, JDBC, and other supported libraries)
but exports no Micrometer meters.

Independently of the Micrometer bridge, the agent collects JVM runtime metrics
and auto-instruments supported HTTP, RPC, database, messaging, and other
libraries for traces and selected metrics. See the
[supported libraries](https://opentelemetry.io/docs/zero-code/java/agent/supported-libraries/)
for the current coverage.

The same setting also turns on the agent's Spring Boot actuator
autoconfiguration, which registers the OpenTelemetry meter registry as a Spring
bean. Spring Boot combines it with the service's existing registry into a
`CompositeMeterRegistry`, and that composite is the registry Spinnaker's
Spectator API wraps, so Spinnaker's own metrics are included. Without it the
agent would only register with Micrometer's static global registry, which
Spinnaker does not publish to. Compare the exported series against
`/spectator/metrics` if you depend on specific Spinnaker metrics.

### Minimal configuration

How you attach the agent depends on your deployment method (Halyard,
Operator, Helm, raw Kubernetes manifests, and so on). In all cases you need:

1. The OTEL Java agent JAR available to the process (for example via an init
   container that copies it into a shared volume, or baked into the image).
2. JVM options and environment variables similar to:

```bash
JAVA_OPTS="-javaagent:/path/to/opentelemetry-javaagent.jar -Dotel.service.name=clouddriver"

OTEL_INSTRUMENTATION_MICROMETER_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://opentelemetrycollector:4318
```

Repeat for each microservice, using a distinct `otel.service.name` (or
`OTEL_SERVICE_NAME`) per service. Point `OTEL_EXPORTER_OTLP_ENDPOINT` at your
collector or at a vendor OTLP ingest URL.

Consult the
[OpenTelemetry Java agent configuration reference](https://opentelemetry.io/docs/zero-code/java/agent/configuration/)
for additional exporters, protocols, resource attributes, and sampling
options.

### New Relic note

The New Relic APM Java agent and the OpenTelemetry Java agent are alternative
instrumentation paths. The New Relic agent does not automatically collect
Spinnaker's Spectator/Micrometer metrics.

{{% alert color="warning" title="Only one Java agent per JVM" %}}
Don't attach both the New Relic APM Java agent and the OpenTelemetry Java agent
to the same process. New Relic's guidance is to [pick one and only one APM
product per process](https://docs.newrelic.com/docs/opentelemetry/get-started/apm-monitoring/opentelemetry-apm-intro/).
Both agents rewrite bytecode and both emit W3C trace context headers, which can
break instrumented classes and [split one request across multiple trace
IDs](https://knowledge.newrelic.com/s/article/Possible-conflicts-between-OpenTelemetry-OpenTracing-the-OTEL-agent-and-the-New-Relic-Java-agent-when-it-comes-to-distributed-tracing).
{{% /alert %}}

New Relic Java agent 9.1.0 and later can, when this support is enabled,
[capture signals recorded through the OpenTelemetry Tracing, Metrics, and Logs APIs](https://docs.newrelic.com/docs/apm/agents/manage-apm-agents/opentelemetry-api-support/).
This does not turn it into the OpenTelemetry Java agent or automatically export
Spinnaker's Micrometer meters. New Relic lists separately installed
OpenTelemetry library instrumentation and Java bytecode auto-instrumentation as
unsupported. Its
[Micrometer instructions](https://docs.newrelic.com/docs/apm/agents/java-agent/related-integrations/micrometer/micrometer-metrics-registry/)
require the OpenTelemetry Micrometer bridge, SDK and exporter, and application
wiring.

Choose one of these collection paths:

* Keep the New Relic APM agent and collect Spinnaker's own metrics separately.
  Scrape `/spectator/metrics` with an external collection pipeline when
  practical. If you need direct, in-process export to New Relic, the
  [legacy Observability Plugin](#legacy-spinnaker-observability-plugin)'s New
  Relic registry remains a compatibility option.
* Use the OpenTelemetry agent instead and send OTLP to New Relic. New Relic
  renders this data as an OpenTelemetry service with
  [APM views](https://docs.newrelic.com/docs/opentelemetry/get-started/apm-monitoring/opentelemetry-apm-ui/)
  for summary metrics, transactions and traces, databases, external services,
  errors, logs, and JVM runtime data. This provides broad APM coverage, but is
  not identical to the New Relic agent: some views are derived from sampled
  spans, and instrumentation coverage and names can differ. The JVM runtime
  view requires `service.instance.id`, which the current OpenTelemetry Java
  agent generates automatically.

## Legacy: Spinnaker Observability Plugin

{{% alert color="warning" title="Legacy" %}}
The Spinnaker Observability Plugin is legacy. Use the OpenTelemetry Java agent
to export Spinnaker's Micrometer metrics when it is your APM agent. Existing
users can keep running the plugin. Deployments that retain the New Relic APM
agent can use the plugin's New Relic registry as a compatibility option. Prefer
external collection of `/spectator/metrics` where practical.
{{% /alert %}}

> The Spinnaker Observability plugin replaced the Spinnaker monitoring daemon,
> which was deprecated as of Spinnaker release 1.20. See the
> [announcement](https://blog.spinnaker.io/announcing-the-new-spinnaker-observability-plugin-d7fbb17e1e07)
> for background.

The plugin collects metrics reported by each microservice instance and
reports them to a third-party monitoring system. It currently supports
[Prometheus](https://prometheus.io/),
[New Relic](https://newrelic.com/), and
[DataDog](https://datadog.com/). The plugin is extensible so that it should
be straightforward to add other systems as well.

The plugin can be configured to control which collected metrics are forwarded
to the persistent metrics store. This can alleviate costs and pressure on the
underlying metric stores depending on your situation.

### Configuring the Spinnaker Observability Plugin

Install and configure the plugin using the
[armory-observability-plugin](https://github.com/armory-plugins/armory-observability-plugin)
repository. Additional configuration examples:

* [Prometheus](https://github.com/armory-plugins/armory-observability-plugin#condensed-prometheus-example)
* [New Relic](https://github.com/armory-plugins/armory-observability-plugin#condensed-nr-example)
* [DataDog](https://github.com/armory-plugins/armory-observability-plugin#condensed-datadog-example)

Plugin `v2.0.0` and later require Spinnaker `2025.4.0` or newer, which is the
release that moved to Spring Boot 3. Use the `v1.6.x` line on earlier
Spinnaker versions.

Once this is complete, you can optionally use the
[spinnaker-mixin](https://github.com/uneeq-oss/spinnaker-mixin) package to
deploy pre-configured [Spinnaker dashboards](#supplied-dashboards) for Grafana.

## Consuming metrics

This data model applies however you collect metrics: by scraping
`/spectator/metrics`, with the
[legacy Observability Plugin](#legacy-spinnaker-observability-plugin), or
through the [OpenTelemetry Micrometer bridge](#opentelemetry-recommended).

Each "metric" has a name and type. Each data point is a numeric value that is
time-stamped at the time of reporting and tagged with a set of one or more
"label"="value" tags. These tag values are strings, though some may have
numeric-looking values. Taken together, the set of tags convey the context for
the reported measurement. Each of these contexts forms a distinct time-series
data stream.

For example a metric counting we requests may be tagged with a "status" label
and values indicating whether the call was successful or not. So rather
than having two metrics, one for successful calls and the other for
unsuccessful calls, there is a single metric, where the underlying
monitoring system can filter the successful from unsuccessful as you want
depending on how you wish to abstract and interpret the data. In practice
the metrics have many tags providing a lot of granularity and ways in
which you can aggregate and interpret them. The data model is described
further in [the Monitoring reference section](/docs/reference/monitoring/).

In practice there are relatively few distinct metric names (hundreds).
However when considering all the distinct time-series streams from the
different label values there are thousands of distinct streams. Some
metrics are tagged with the application or account they were used on
behalf of, so the number of streams may grow as the scope of your
deployment grows. Typically you will be aggregating these dimensions
together while breaking out along others. The granularity can come in
handy when it comes time to diagnose problems or investigate for deeper
understanding of runtime behaviors but you can aggregate across dimensions
(or parts of dimensions) when you dont care about that level of refinement.

### Types of metrics

There are two basic types of metrics currently supported,
*counters* and *gauges*.

  * __Counters__ are monotonically increasing values over the lifetime of
    the process. The process starts out with them at 0, then increments
    them as appropriate. Some counters may increase by 1 each time, such
    as the number of calls. Other counters may increase by an arbitrary
    (but non-negative) amount, such as number of bytes.

    Counters are scoped to the process they are in. If you have a counter
    in each of two different microservice replicas (including a restart),
    those counters will be independent of one another. Each process only
    knows about itself. Collection tooling typically adds a tag to each
    data point that identifies which instance it came from so that you can
    drill down into individual instances if you need. However, typically
    you will use your monitoring system to aggregate counters across all
    replicas.

    Counters are useful to determine rates. Given two points in time,
    the counter differences will be the measurement delta and the
    delta divided by the time difference will be the rate.
    (divide by another 1000000 to convert nanoseconds to milliseconds,
     such as for latency-oriented metrics or by another 100000000 for seconds,
     such as for call-rate metrics).

    * Spinnaker also has a special type of counter called a *Timer*.

      __Timers__ are used to measure timing information. These are
      always in nanoseconds. When consuming metrics straight from
      Spinnaker, a Timer will have two complementary time series.
      One will have a tag "statistic" with the value "count" and
      the other a tag with a "statistic" with the value "totalTime".

      The "count" represents the number of measurements taken.
      The "totalTime" represents the number of nanoseconds measured
      across all the calls. Dividing the "totalTime" by the "count"
      over some time window gives the latency over that time window.

      For example given a series of measurements for the pair of
      metrics example__count and example__totalTime, where the
      sum of the __count values was 5 and of the __totalTime values
      was 50000000, then dividing the time by count gives
      10000000 as an average time per count. Since this is in nanoseconds,
      we can divide by another 1000000000 to get 0.1 seconds per call.
      (or we could divide by 1000000 to get 100 milliseconds per call)

      Note that in order to do this, the tag bindings for the two measurements
      should be the same. Dividing measurements whose count has a success=true
      tag by times that have success=false tags wont give you the average time
      of the success calls (but would give you the average cost in total time
      spent for each successful call outcome if that is what you wanted.)


  * __Gauges__ are instantaneous value readings at a given point in time.
    Like counters, individual gauges are scoped to individual microservice
    instances. Collection tooling typically adds an instance tag to each
    data point so that you can identify the particular instance if you want
    to, but typically you will use your monitoring system to aggregate across
    instances.

    Since gauges are instantaneous, the values between samples is
    unknown. Gauges are useful to determine current state, such as the
    size of queues. Sometimes answers to questions provided by gauges
    (e.g. active requests) might be answered by taking the difference
    in counters (e.g. completed requests - started requests).


### Example

Each microservice has a `controller.invocations` metric used to
instrument API calls into it. Since this is a timer, in practice
this is broken out into two 'controller.invocations\_\_count' and
'controller.invocations\_\_totalTime'.

These typically have the labels "controller", "method", "status",
"statusCode", and "success". Some microservices may add an additional
label such as "account" or "application" depending on the nature of
the microservices API.

These metrics will have several time series, such as those with the
following tag bindings:

| account    | controller             | method                      | status | statusCode | success |
|------------|------------------------|-----------------------------|--------|------------|---------|
| my-account | ClusterController      | getForAccountAndNameAndType | 2xx    | 200        | true    |
| my-account | ClusterController      | getForAccountAndNameAndType | 4xx    | 404        | false   |
| my-account | ClusterController      | getForAccountAndNameAndType | 4xx    | 400        | false   |
| None       | ApplicationsController | list                        | 2xx    | 200        | true    |
| None       | ApplicationsController | get                         | 2xx    | 200        | true    |
| None       | ApplicationsController | get                         | 4xx    | 404        | false   |

You can aggregate over the success tag to count successful calls vs failures,
perhaps breaking out by controller and/or method to see where the failures
were. You can break out by statusCode to see which controller and/or
method the errors are coming from and so forth.

Different metrics have different tags depending on their concept and
semantics. Some of these tags may be of more interest than others. In
the case above, some of the tags are at different levels of abstraction
and not actually independent. For example a 2xx status will always be
success=true and a non-2xx status code will always be success=false.
Which to use is a matter of convenience but given the status tag (which
can distinguish 4xx from 5xx errors) the success tag does not add any
additional time-series permutations since its value is not actually
independent.

### Supplied dashboards

Each of the supplied monitoring solutions provides a set of dashboards
tailored for that system. These are likely to evolve at different rates
so are not completely analogous or consistent across systems and might
not be completely consistent with the document. However, the gist and
intent described here should still hold since the monitoring intent is
the same across all the concrete systems.

As a rule of thumb, the dashboards currently prefer showing value differences
(over rates) for 1-minute sliding windows. This might change in the future.
Some of the caveats here are due to the choice to show values over rates, but
at this time the values seem more meaningful than rates, particularly where
there arent continuous streams of activity. Where latencies are shown, they
are computed using the counters from the past minute.

Depending on the chart and underlying monitoring system, some charts show
instantaneous value differences (between samples) while others show
differences over a sliding window. The accuracy of the timeline may vary
depending on the dashboard, but the underlying trends and relative signals
over time will still be valid.


#### Types of dashboards

There are several different dashboards. Each monitoring system has its own
implementation of the dashboards. See the corresponding documentation for
that system for more details or caveats.

*__Note__: Some systems might have an earlier prototype "KitchenSinkDashboard"
that has not yet been broken out into the individual dashboards. Most of the
information is still there, just all in the one dashboard.*

   * __*&lt;Microservice&gt;* Microservice__

     These dashboards are tailored for an individual microservice. As a rule
     of thumb they provide a system wide view of all replicas of a given
     microservice while also letting you isolate a particular instance. They
     show success/error counts and latencies for the different APIs the
     microservice offers as well as special metrics that are fundamental to
     the operation or responsibilities of that particular service.

   * __Spinnaker *&lt;Provider&gt;* API__

     These dashboards are tailored for a particular cloud provider. They
     show a system level perspective of Spinnaker's interaction with that
     provider. Depending on the provider, the dashboard details may vary.
     In general they offer a system wide view while also letting you isolate
     a particular instance and region, showing success/error counts and
     latencies for different resource interactions or individual operations.
     This provides visibility into what your deployment is doing and where
     any problems might be coming from.

   * __Minimal Spinnaker__

     The intent of this dashboard is provide the most essential or useful
     metrics to quickly suggest whether there are any issues and confirm
     Spinnaker is behaving normally. Your needs may vary so consult each of
     the other dashboards and consider refining your own. If you do, also
     consider sharing that back!
