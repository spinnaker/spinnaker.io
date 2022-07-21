---
title: "Caching: Account Name Based Sharding"
linkTitle: "Caching: Account Name Based Sharding"
weight: 2
description: "How to shard caching agents among the available caching pods based on the account name"
---

## Overview

Account name based sharding is applicable to the caching function of a clouddriver. In case of HA mode, it is applicable to clouddriver-caching pods only. 
This feature is added at caching scheduler(both redis & sql backed) level which means it's applicable to any cloud provider.

This is a configurable feature. When configured, all the caching agents of an account are run by a single caching pod. 
The logic of identifying the account whose caching agents are to be run in a particular pod is dependent on the name of the account(hashcode) and the number of available caching pods.
When the pods are scaled up or down, the agents will resettle to the same or a different pod based on the sharding logic.

## Configuration

This feature can be enabled by setting `cache-sharding.enabled` property to `true` which by default is `false`.
The below configuration needs to be added to appropriate configuration file (ex: clouddriver-local.yaml):

```yaml
cache-sharding:
  enabled: true
```

## Additional Details
The implementation details are available at the following PR links.

[feat(cats/sql): account name based sharding logic](https://github.com/spinnaker/clouddriver/pull/5295)


[feat(cats/redis): account name based sharding logic](https://github.com/spinnaker/clouddriver/pull/5382)


[refactor(cats/sql): made sharding configuration consistent](https://github.com/spinnaker/clouddriver/pull/5512)


