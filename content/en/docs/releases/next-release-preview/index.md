---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.31

### [doNotEval SpEL helper](https://spinnaker.io/changelogs/1.30.0-changelog/#donoteval-spel-helper)
This feature is now enabled by default

### Echo

https://github.com/spinnaker/echo/pull/1292 adds a new configuration flag: `pipelineCache.filterFront50Pipelines` that defaults to false.  When false, echo caches all pipelines front50.  When true, it only caches enabled pipelines with enabled triggers of specific types -- the types that echo knows how to trigger, along with some changes to the logic for handling manual executions so they continue to function.  This is typically a very small subset of all pipelines.

### Orca

https://github.com/spinnaker/orca/pull/4448 adds a new configuration flag: `front50.useTriggeredByEndpoint` that defaults to false.  When false, orca queries front50 for all pipelines each time a pipeline execution completes.  When true, orca only queries for pipelines triggered when a specific pipeline completes which is potentially a very small subset of all pipelines.

### Front50

https://github.com/spinnaker/front50/pull/1252 adds optional query parameters for enabledPipelines (boolean),  enabledTriggers (boolean), and triggerTypes (string) to the GET /pipelines endpoint and a new GET /pipelines/{application:.+}/name/{name:.+} endpoint to get one pipeline by application and name.

https://github.com/spinnaker/front50/pull/1251 adds a new GET /pipelines/triggeredBy/{id:.+}/{status} endpoint.

https://github.com/spinnaker/front50/pull/1249 adds three new configuration flags for [each object type under service-storage](https://github.com/spinnaker/front50/blob/568743732dcb47cc576a178795b6a992923f1d3c/front50-core/src/main/java/com/netflix/spinnaker/front50/config/StorageServiceConfigurationProperties.java#L8).

* storage-service.*.cacheHealthCheckTimeoutSeconds: The cache is considered healthy if it's been refreshed in `cacheHealthCheckTimeoutSeconds` seconds.  The default is 90.

* storage-service.*.synchronizeCacheRefresh: When true, if multiple threads attempt to refresh the cache in StorageServiceSupport simultaneously, only one actually does the refresh. The others wait until it's complete. This reduces load on the data store.  The default is false.

* storage-service.*.optimizeCacheRefreshes: Only implemented for sql data stores.  When true, for objects that support versioning, cache refreshes only query the data store for objects modified (or deleted) since the last refresh.  The default is false.

`synchronizeCacheRefresh` and `optimizeCacheRefreshes` improve the performance of keeping front50's in-memory cache up to date.  Here's an example of setting them to true for both applications and pipelines.

    storage-service:
      application:
        optimizeCacheRefreshes: true
        synchronizeCacheRefresh: true
      pipeline:
        optimizeCacheRefreshes: true
        synchronizeCacheRefresh: true
