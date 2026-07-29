---
title: 'Monitoring'
linkTitle: 'Monitoring'
description: Reference documentation for the metrics reported by Spinnaker microservices
---

If you're looking for instructions on how to install or setup monitoring, see the
[Enable Monitoring](/docs/setup/other_config/monitoring/) section in the
[Spinnaker Setup Guide](/docs/setup/).

## Metrics overview

A Spinnaker metric is a named collection of measurements used to track
a type of activity over time. There are two basic types of metrics: counters
and gauges. A counter measures how many times the activity occurred over the
lifetime of the process (e.g. how many actions have ever occurred) whereas
a gauge measures an instantaneous value (e.g. how many actions are active now).

Each recorded measurement has a set of tags and a timestamped value.
The tags are used to capture the context or aspect of the value.
For example, each Spinnaker microservice uses a single counter metric
(`controller.invocations`) to monitor how many HTTP calls it handled.
Since the microservices have many different HTTP endpoints, they add
a tag (`method`) to the measurement indicating which was called.
Internally the endpoints are grouped together for different types that
are managed by a particular controller, so the measurements are also tagged
with a `controller` tag.

Operationally, you want to be able to distinguish successful calls from
failures in order to detect problems. Rather than creating different metrics
for each type of failure or success, the measurements are tagged with a
`success` tag as well as a `statusCode` tag. The end result is that there is
just a single metric `controller.invocations`, but the measurements within it
are richly decorated with details so that individual metrics can be filtered
to view a much finer granularity.

In essence, the sequence of timestamped measurements for a Spinnaker metric
can be partitioned by their tag bindings so that all the measurements for the
same set of tag bindings form their own sequence (e.g. all the successful
calls to the `list` method vs all the failed calls to the `list` method).
The monitoring system treats each of these as its own time-series and allows
you to filter by some tags, then aggregate or break out by others.

## Metric types

### Counters

Counters are monotonically increasing values over the lifetime of the process.
The process starts at 0 and increments as appropriate. Counters are scoped to
the process — each replica has its own independent count that resets on restart.
Your monitoring backend is responsible for aggregating counters across replicas.

Use counter differences over a time window to compute rates:

```promql
# Rate of pipeline completions per second over the last 5 minutes
rate(executions_completed_total[5m])
```

### Timers

Timers are a special counter type that measures durations. When exported via
the OTEL Micrometer bridge, timers appear as Prometheus histograms with
`_bucket`, `_count`, and `_sum` suffixes (durations in seconds). Use these
to compute latency percentiles and averages:

```promql
# 99th-percentile controller invocation latency
histogram_quantile(0.99,
  sum by (le, controller) (
    rate(controller_invocations_seconds_bucket[5m])
  )
)

# Average controller latency
rate(controller_invocations_seconds_sum[5m])
  / rate(controller_invocations_seconds_count[5m])
```

### Gauges

Gauges are instantaneous value readings. They are useful for current state
such as queue depths, active executions, or thread counts. Like counters,
gauges are scoped to individual instances.

```promql
# Active pipelines across all Orca replicas
sum(executions_active{executionType="pipeline"})
```

## Cardinality and high-cardinality tags

Spinnaker metrics use a multi-dimensional tag model that can produce a large
number of time-series. Understanding which tags drive cardinality is important
for keeping your monitoring backend performant and cost-effective.

### The `controller.invocations` cardinality example

`controller_invocations_total` is the most widely-used metric and also the
most cardinality-intensive. Its label set includes:

| Label | Description | Cardinality driver |
|---|---|---|
| `controller` | Spring MVC controller class name | ~10–20 per service |
| `method` | Handler method name | ~5–30 per controller |
| `status` | HTTP status class: `2xx`, `4xx`, `5xx` | 3 values |
| `statusCode` | Exact HTTP status code | ~5–10 values |
| `success` | `true` or `false` | 2 values |
| `cause` | Exception class on failure, `None` on success | unbounded |
| `application` | Spinnaker application name (some endpoints only) | **grows with usage** |
| `account` | Cloud account name (some endpoints only) | **grows with usage** |
| `percentile` | Percentile bucket when using timer percentiles | **multiplies all series** |
| `statistic` | `count`, `totalTime`, or `percentile` | 3+ values |

A modest Spinnaker installation can produce **800+ time-series** from
`controller_invocations_total` alone. At scale with many applications and
accounts this grows further.

**Recommendations to control cardinality:**

- Drop the `percentile` statistic series at the OTEL Collector if you use
  histogram quantiles instead:
  ```yaml
  processors:
    filter/drop_percentiles:
      metrics:
        datapoint:
          - 'attributes["statistic"] == "percentile"'
  ```
- Drop high-cardinality labels you don't need (`cause`, `statusCode`) using
  the `transform` processor.
- If `application` and `account` labels grow too large, consider aggregating
  them away at the collector before writing to your backend.

### Labels that grow with deployment scale

The following labels are unbounded and grow as you add applications, accounts,
and pipelines:

| Label | Appears on | Notes |
|---|---|---|
| `application` | `controller_invocations_total`, `executions_completed_total`, `executions_started_total` | One value per Spinnaker application |
| `account` | `controller_invocations_total` (clouddriver) | One value per configured cloud account |
| `task` | `orca_task_result_total` | Full Java class name per task type |
| `status` (orca) | `executions_completed_total`, `orca_task_result_total` | SUCCEEDED, TERMINAL, FAILED_CONTINUE, CANCELED |

## Metric naming: Spectator vs OTEL

Spinnaker internally uses the [Spectator](https://netflix.github.io/spectator/)
library. When metrics flow through the OTEL Java agent's Micrometer bridge, the
naming convention changes slightly to follow Prometheus/OTEL conventions.

| Original Spectator name | Exported OTEL/Prometheus name |
|---|---|
| `controller.invocations` | `controller_invocations_total` / `controller_invocations_seconds` |
| `executions.active` | `executions_active` |
| `executions.completed` | `executions_completed_total` |
| `executions.started` | `executions_started_total` |
| `orca.task.result` | `orca_task_result_total` |
| `echo.events.count` | `echo_events_count_total` |
| `fiat.permissionsCache.hits` | `fiat_permissionsCache_hits_total` |
| `front50.requests` | `front50_requests_total` |

Dots are replaced with underscores. Counter metrics gain a `_total` suffix.
Timer metrics gain `_seconds_bucket`, `_seconds_count`, and `_seconds_sum`
suffixes (or `_max_seconds` for the maximum).

## Key metrics by service

### All services — cross-cutting

These metrics appear on every Spinnaker microservice.

#### `controller_invocations_total` / `controller_invocations_seconds`

The primary API observability metric. Every HTTP request handled by a
microservice is recorded here.

**Type**: Counter / Timer histogram

**Labels**:
- `controller` — Spring MVC controller (e.g. `ApplicationsController`, `PipelineController`)
- `method` — Handler method name (e.g. `list`, `get`, `save`)
- `status` — HTTP status class: `2xx`, `4xx`, `5xx`
- `statusCode` — Exact HTTP status code
- `success` — `true` or `false`
- `cause` — Exception class name on failure, `None` on success
- `application` — Spinnaker app name (only on endpoints that operate on an app)
- `account` — Cloud account name (only on endpoints scoped to an account)
- `criticality` — Internal priority tag

**Example PromQL**:
```promql
# Error rate by controller (5m window)
sum by (controller) (
  rate(controller_invocations_total{success="false"}[5m])
)
/
sum by (controller) (
  rate(controller_invocations_total[5m])
)

# p99 latency by controller and method
histogram_quantile(0.99,
  sum by (le, controller, method) (
    rate(controller_invocations_seconds_bucket[5m])
  )
)
```

**Real label example** (from Front50 `PipelineController`):
```
controller="PipelineController"
method="list"
status="2xx"
statusCode="200"
success="true"
application="myapp"
cause="None"
criticality="unknown"
```

#### `executor_queued_tasks` / `executor_active_threads`

Thread pool queue depth and active thread counts. Sustained queue buildup
indicates a service is overloaded.

**Type**: Gauge

**Labels**:
- `name` — Thread pool name (e.g. `messageHandlerPool`, `QueryAll`)

**Example PromQL**:
```promql
# Alert if any executor queue is growing
executor_queued_tasks > 50
```

#### JVM metrics (from OTEL agent)

These are emitted automatically by the OTEL Java agent with no Spinnaker-specific
configuration required.

| Metric | Type | Key labels | Notes |
|---|---|---|---|
| `jvm_memory_used_bytes` | Gauge | `area` (heap/nonheap), `id` (pool name) | Watch G1 Old Gen for heap pressure |
| `jvm_gc_duration_seconds` | Histogram | `gc` (collector name), `action` | High GC duration correlates with latency spikes |
| `jvm_gc_pause_seconds` | Histogram | `action`, `cause` | Stop-the-world pauses |
| `jvm_thread_count` | Gauge | `daemon`, `state` | Unexpected thread growth indicates leaks |
| `jvm_cpu_recent_utilization_ratio` | Gauge | — | Per-JVM CPU, 0.0–1.0 |

**Example PromQL**:
```promql
# Heap usage % per pod
jvm_memory_used_bytes{area="heap"}
  / jvm_memory_limit_bytes{area="heap"}
```

#### HTTP metrics (from OTEL agent)

The OTEL agent emits these using [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/), separate from the Micrometer `controller_invocations` metrics.

| Metric | Type | Key labels |
|---|---|---|
| `http_server_request_duration_seconds` | Histogram | `http_request_method`, `http_response_status_code`, `http_route` |
| `http_client_request_duration_seconds` | Histogram | `http_request_method`, `http_response_status_code`, `url_scheme`, `server_address` |

---

### Orca (pipeline orchestration)

#### `executions_active`

Current count of in-progress pipeline and orchestration executions.

**Type**: Gauge

**Labels**:
- `executionType` — `pipeline` or `orchestration`

```promql
# Total active pipelines
sum(executions_active{executionType="pipeline"})
```

#### `executions_completed_total` / `executions_started_total`

Pipeline and orchestration lifecycle counters. `application` label makes this
a cardinality risk on large installations.

**Type**: Counter

**Labels**:
- `executionType` — `PIPELINE` or `ORCHESTRATION`
- `application` — Spinnaker application name (**unbounded**)
- `status` — Terminal status: `SUCCEEDED`, `TERMINAL`, `CANCELED`, `FAILED_CONTINUE`
- `origin` — Trigger origin: `api`, `unknown`, etc.

**Real label examples**:
```
application="testing"  executionType="PIPELINE"  origin="unknown"  status="SUCCEEDED"
application="demo"     executionType="PIPELINE"  origin="api"      status="TERMINAL"
```

**Example PromQL**:
```promql
# Pipeline failure rate by application
rate(executions_completed_total{status="TERMINAL"}[1h])
  / ignoring(status) group_left
rate(executions_completed_total[1h])
```

#### `orca_task_result_total`

Counts individual task completions within pipeline stages. The `task` label
contains the full Java class name.

**Type**: Counter

**Labels**:
- `task` — Fully-qualified task class name (e.g. `com.netflix.spinnaker.orca.clouddriver.tasks.manifest.DeployManifestTask`)
- `status` — `SUCCEEDED`, `TERMINAL`, `FAILED_CONTINUE`

**Cardinality**: Low-to-medium — grows with the number of distinct task types
in use, but task types are bounded by the Spinnaker version.

**Example PromQL**:
```promql
# Count of failed tasks by type
sum by (task) (
  rate(orca_task_result_total{status="TERMINAL"}[5m])
)
```

---

### Echo (events and triggers)

#### `echo_events_count_total` / `echo_events_duration_seconds`

Tracks events flowing through Echo's event pipeline (before and after listeners).

**Type**: Counter / Timer

**Labels**:
- `execution` — `before` or `after` (which listener phase)
- `statistic` — `count` (may also appear from Spectator export)

#### `echo_triggers_sync_executionTimeMillis`

Time taken by Echo to sync pipeline triggers during the scheduled trigger polling cycle.

**Type**: Timer histogram

---

### Fiat (authorization)

#### `fiat_permissionsCache_hits_total` / `fiat_permissionsCache_misses_total`

Cache effectiveness for the Fiat permissions cache. A high miss rate means
Fiat is making frequent calls to the upstream role provider.

**Type**: Counter (no cardinality-driving labels on this instance)

```promql
# Cache hit ratio
rate(fiat_permissionsCache_hits_total[5m])
  / (
    rate(fiat_permissionsCache_hits_total[5m])
    + rate(fiat_permissionsCache_misses_total[5m])
  )
```

#### `fiat_userRoles_syncCount` / `fiat_userRoles_syncTime`

Tracks how many user role syncs complete and how long they take.

**Type**: Gauge / Timer

---

### Front50 (pipeline and application storage)

#### `front50_requests_total`

Total requests handled by Front50 (no label breakdown in current OTEL export).

**Type**: Counter

#### `front50_lastPoll`

Timestamp of Front50's last successful poll from its backing store. If this
stops advancing, Front50 is unable to read fresh data.

**Type**: Gauge

---

### SQL-backed Orca metrics

When Orca uses a SQL execution repository, timing metrics are emitted per
repository operation.

| Metric | Labels | Notes |
|---|---|---|
| `sql_executions_addStage1_timing_seconds` | `repository`, `result` | Stage write latency |
| `sql_executions_store1_timing_seconds` | `repository`, `result` | Execution write latency |
| `sql_executions_updateStatus1_timing_seconds` | `repository`, `result` | Status update latency |
| `retrieveById_sql_executions_timing_seconds` | `repository`, `result` | Execution read latency |

The `repository` label is `primary` for the main database. `result` is
`SUCCESS` or `FAILURE`.

---

## JSON document format

Metrics are also available directly from each microservice at the
`/spectator/metrics` endpoint. The format is documented here for reference,
though the OTEL pipeline is the recommended collection method.

### Top-level document

| Key | Format | Description |
| --- | --- | --- |
| applicationName | string | The name of the microservice. |
| applicationVersion | string | The version number of the microservice. |
| metrics | [See Metric Entry](#metric-entry) | The individual metric entries. |
| startTime | int | Unix epoch time _milliseconds_ that process started. |

### Metric entry

The metrics dictionary contains an entry for each reported metric name.
The dictionary key is the name of the metric.

| Key | Format | Description |
| --- | --- | --- |
| kind | String | `Counter`, `Gauge`, or `Timer` |
| values | List of [Time-Series Data Point](#time-series-data-point) | Current value for each tag combination |

### Time-series data point

| Key | Format | Description |
| --- | --- | --- |
| tags | List of Tag Bindings | Each binding is `{"key": "tagname", "value": "tagvalue"}` |
| values | List of Timestamped Value | Single element: `{"v": <number>, "t": <epoch-ms>}` |

**Example** — `controller.invocations` from Front50:

```json
{
  "tags": [
    {"key": "application",  "value": "mysnazzyapp"},
    {"key": "controller",   "value": "PipelineController"},
    {"key": "method",       "value": "listByApplication"},
    {"key": "statistic",    "value": "count"},
    {"key": "status",       "value": "2xx"},
    {"key": "statusCode",   "value": "200"},
    {"key": "success",      "value": "true"}
  ],
  "values": [{"t": 1500000000000, "v": 100.0}]
}
```

Note that the `v` values are for the lifetime of this particular process
instance only and reset on restart. Each replica has its own independent count.
