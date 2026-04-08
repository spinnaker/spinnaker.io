---
title: "Set up Canary Analysis Support"
linkTitle: "Canary"
weight: 35
description: Set up Automated Canary Analysis to perform Canary deployments with Spinnaker.
---

Setting up automated canary analysis in Spinnaker consists of configuration for
Kayenta which does canary analysis by querying metrics, storing the canary configuration templates, and
storage for the canary reports in a storage location.  Before you can use the canary
analysis service, you must configure at least one metrics service, and at least
one storage service. The most common setup is to have one metrics service
configured (e.g. Stackdriver, Atlas, Prometheus, Datadog or New Relic) and one storage
service (e.g. S3, GCS or Minio) configured. 

## Quick start 

If you'd prefer to just get up and running quickly a very simple example with prometheus
for metrics and s3 for storing the results/reports looks like the below.  Add
this to your `kayenta-local.yml` file.

```yaml
kayenta:
  ## This doesn't enable metrics, but does enable STORAGE of data
  ## using a minio server as an example.
  ## SQL IS supported, but has not been regularly tested at this time.
  aws:
    accounts:
      - accessKeyId: minio
        bucket: canaries
        endpoint: http://minio:9000
        name: minio
        rootFolder: kayenta
        secretAccessKey: secretKey
        supportedTypes:
          ## ONLY object/config stores are supported.  CloudWatch
          ## Metrics are NOT supported in any OSS distribution
          ## at this point in time.
          - CONFIGURATION_STORE
          - OBJECT_STORE
    enabled: true
  prometheus:
    accounts:
      - endpoint:
          baseUrl: http://prometheus.monitoring:9090
        name: local-prometheus
        supportedTypes:
          - METRICS_STORE
      - endpoint:
          baseUrl: http://prometheus.monitoring:9090
        name: local-prometheus-2
        supportedTypes:
          - METRICS_STORE
    enabled: true
  ## Note though AWS is enabled, you must ALSO have s3 enabled
  s3:
    enabled: true
```
You also need the following in deck in the `settings-local.js` to set some defaults depending
upon which canary you choose to enable for which purpose
```javascript
window.spinnakerSettings.canary.metricsAccountName = local-prometheus;
// note that this is the metricStore TYPE.  NOT an account NAME
window.spinnakerSettings.canary.metricStore = prometheus; 
// Storage account allows segmentation of reports/types as needed.
window.spinnakerSettings.canary.storageAccountName = minio;

```
## Specify the scope of canary configs

By default, each [canary configuration](/docs/guides/user/canary/config/) is
visible to all pipeline canary stages in all apps. But you can change that so
each canary config will be VISIBLE in the application it was created.

Add the following to your `settings-local.js` in deck
```javascript
window.spinnakerSettings.canary.showAllCanaryConfigs = false;
```
Set it to `true` to revert to global visibility.

## Set the canary judge

The current default judge is `NetflixACAJudge-v1.0`. The behavior of this judge
is described [here](/docs/guides/user/canary/judge/).

If there are any other judges available in your world, you can set Spinnaker to
use it:

Add the following to your `settings-local.js` in deck
```javascript
window.spinnakerSettings.canary.defaultJudge = 'static-baseline-judge';
```

## Identify your metrics provider

Some options for metrics are:

* `atlas` (see [Netflix Atlas](https://netflix.github.io/atlas-docs/))
* `datadog`
* `stackdriver`
* `prometheus`
* `newrelic`
* `signalfx`

> **Note**: Setup instructions for Atlas and SignalFx are not included in this
> guide. Refer to the respective provider documentation and Kayenta source code
> for configuration details.

## Provide the default metrics account

Add the account name to use for your metrics provider. This default can be
overridden in [canary configuration](/docs/guides/user/canary/config/)
as seen above

## Provide the default storage account

Add the account name for your [storage provider](/docs/setup/install/storage).
This default can be overridden in [canary
configuration](/docs/guides/user/canary/config/).

This default can be
overridden in [canary configuration](/docs/guides/user/canary/config/)
as seen above

## Set up canary analysis to use Datadog

If your telemetry provider is Datadog, add the datadog
configuration to `kayenta-local.yml`.  You can add/remove
additional accounts as needed.

```yaml
kayenta:
  datadog:
    enabled: true
    accounts:
    - name: my-dd-account
      apiKey: apiKey
      applicationKey: appKey
      endpoint:
        baseUrl: https://api.datadog.com
      supportedTypes:
      - METRICS_STORE
```

## Set up canary analysis for Google

Configure your canary analysis to work with
Google, including [Stackdriver](https://cloud.google.com/stackdriver)
and [GCS](https://cloud.google.com/storage/).
Add the following configuration to `kayenta-local.yml`.  You can add/remove
additional accounts as needed.

```yaml
kayenta:
  google:
    enabled: true
    accounts: 
    - name: my-google-account
      bucket: my-gcs-storage-bucket
      bucket-location: location
      json-path: authData
      project: myproject
      root-folder: sometplace
      supportedTypes:
        - CONFIG_STORE
```

    ## Set up canary analysis to use New Relic

If your telemetry provider is New Relic, add the following
to your `kayenta-local.yml`

```yaml
kayenta:
  newrelic:
    enabled: true
    accounts:
    - name: accountName
      apiKey: nrqlApiKey
      applicationKey: appKey
      endpoint:
        baseUrl: https://insights-api.newrelic.com
      supportedTypes:
        - METRICS_STORE
```

More providers/configuration options are available in the kayenta codebase.  NOT
all providers support configuration stores.  You can see configuration
references for most providers [in their configuration files like the newrelic configuration files](https://github.com/spinnaker/spinnaker/blob/main/kayenta/kayenta-newrelic-insights/src/main/java/com/netflix/kayenta/newrelic/config/NewRelicConfiguration.java)
These generally are found in the `com/netflix/kayenta/<provider>/config/` folder for each library type.
