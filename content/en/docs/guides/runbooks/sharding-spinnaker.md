---
title: "Sharding Spinnaker"
linkTitle: "Sharding Spinnaker"
weight: 2
description: "How to shard traffic to different areas of Spinnaker, in case a service doesn't efficiently serve all queries with a single instance of Orca or Clouddriver."
---

## Intro

This document shows you how to shard traffic to different Spinnaker services based upon configured criteria. The general pattern is to define a selector class in your configuration. Endpoints will then be selected based upon the criteria specified in the selectors.

As an example, Netflix creates read-only shards for Clouddriver to better manage requests.

Selectors exist at these levels:

* Application
* Execution type (i.e, Pipeline vs Orchestration)
* Origin
* Authenticated User
* Deployment account
* Cloud Provider

You will need to modify your Spinnaker deployment pipelines to ensure the infrastructure for each shard is correctly created, otherwise traffic could be sent to non-existent shards.

If no selector is specified, the default endpoint will be used.

Additionally, there is a special dynamicEndpoints configuration in gate.yml to send all requests from Deck to that particular shard.

## Sharding Orca Requests

In gate.yml

```
services:
  orca:
    shards:
      baseUrls:
        - baseUrl: https://orca.example.com
        - baseUrl: https://orca-shard1.example.com
          priority: 10
          config:
            selectorClass: com.netflix.spinnaker.kork.web.selector.ByApplicationServiceSelector
            applicationPattern: xxxxyyyapp |demo.*xxxxyyyy
```

## Clouddriver Read-only Shards

gate.yml

```
services:
  clouddriver:
    baseUrl: https://clouddriver-readonly.example.com
    config:
      dynamicEndpoints:
        deck: https://clouddriver-readonly-deck.example.com
```

orca.yml

```
clouddriver:
  readonly:
    baseUrls:
    - baseUrl: https://clouddriver-readonly-orca-1.example.com
      priority: 10
      config:
        selectorClass: com.netflix.spinnaker.orca.clouddriver.config.ByExecutionTypeServiceSelector
        executionTypes:
          - orchestration
    - baseUrl: https://clouddriver-readonly-orca-2.example.com
      priority: 20
      config:
        selectorClass: com.netflix.spinnaker.orca.clouddriver.config.ByApplicationServiceSelector
        applicationPattern: app1|.*app2.*
    - baseUrl: https://clouddriver-readonly-orca-3.example.com
      priority: 30
      config:
        selectorClass: com.netflix.spinnaker.orca.clouddriver.config.ByOriginServiceSelector
        origin: deck
        executionTypes:
          - orchestration
    - baseUrl: https://clouddriver-readonly-orca-4.example.com
      priority: 50
      config:
        selectorClass: com.netflix.spinnaker.orca.clouddriver.config.ByAuthenticatedUserServiceSelector
        users:
          - horseman.*
          - bojack.*
    - baseUrl: https://clouddriver-readonly-orca-5.example.com
```

## Clouddriver Write-only Shards

orca.yml

```
clouddriver:
  writeonly:
    baseUrls:
    - baseUrl: https://clouddriver-write-kubernetes.example.com
      priority: 10
      config:
        selectorClass: com.netflix.spinnaker.kork.web.selector.ByCloudProviderServiceSelector
        cloudProviders: 
          - kubernetes
    - baseUrl: https://clouddriver-write-cloudfoundry.example.com
      priority: 20
      config:
        selectorClass: com.netflix.spinnaker.kork.web.selector.ByCloudProviderServiceSelector
        cloudProviders: 
          - cloudfoundry
    - baseUrl: https://clouddriver-write-heavy-account.example.com
      priority: 30
      config:
        selectorClass: com.netflix.spinnaker.kork.web.selector.ByAccountServiceSelector
        accountPattern: heavyUsageAccount.*|.*app2.*
    - baseUrl: https://clouddriver-write-heavy-users.example.com
      priority: 40
      config:
        selectorClass: com.netflix.spinnaker.orca.clouddriver.config.ByAuthenticatedUserServiceSelector
        users:
          - horseman.*
          - bojack.*
    - baseUrl: https://clouddriver-write.example.com
```
