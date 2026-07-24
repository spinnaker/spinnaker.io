---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.3.0

## Breaking Changes

### AWS V2 SDK migration
The caching agents and code have been moved to the AWS V2 SDK. Any V1 usage via plugins or similar will no longer work going forward.

### Angular removed
Angular has been removed from the Spinnaker project. For any plugins or forks, please migrate to React. This is a substantial migration — a big thank you to the contributors, primarily Matt Gogerly.

### SAML configuration has moved to Spring configuration

A few properties remain that enable parsing users and translating custom fields, but all content has moved to native Spring SAML configuration. [Full migration docs are available](https://github.com/spinnaker/spinnaker/blob/main/gate/gate-saml/docs/saml-migration.md).

For a minimal example:
```yaml
saml:
  enabled: true
  user-attribute-mapping:
    email: email
    roles: memberOf
  # This is defaulted and not required, but you MUST set the ACS URL below
  login-processing-url: /saml/SSO

spring:
  security:
    saml2:
      relyingparty:
        registration:
          SSO:                          # registration ID (arbitrary key, used in URLs, set here to SSO to mimic Spinnaker behavior)
            acs:
              # Keeps older login URLs for now.
              location: "{baseUrl}/saml/SSO"
            entity-id: spinnaker
            assertingparty:
              metadata-uri: https://idp.example.com/saml/metadata
              singlesignon:
                sign-request: true
            signing:
              credentials:
                - private-key-location: /etc/gate/saml/private_key.pem
                  certificate-location: /etc/gate/saml/certificate.pem
```

## Removals and Deprecations

### Binaries & core utilities upgraded/removed
[Upgrades/removal of old versions](https://github.com/spinnaker/spinnaker/pull/7787) — many older libraries and SDKs have been upgraded and/or removed. Some of these (like Helmfile) do not receive as much testing as we'd like, so please verify if you use these libraries.

* Kustomize 5 is added. Kustomize 4 is updated to the latest supported version.
* Helmfile is upgraded to 1.7.0.
* Packer is upgraded to the latest release (1.14).
* kubectl binaries used for operations are updated to 1.30. Older versions are removed. You can select a newer version.
* aws-iam-authenticator binary is upgraded to the latest supported version.
* Base images are upgraded from Alpine 3.20 to 3.24. Ubuntu is moved to the latest release.

### Old Kubernetes resource types removed
[Very old API specs are removed](https://github.com/spinnaker/spinnaker/pull/7802/changes). Specifically:
* `extensions/v1beta1`
* `networking.k8s.io/v1beta1`

Associated libraries for Kubernetes are also upgraded to a currently supported release. This removes support for any resources using these types — please update your plugins as appropriate. These API versions were removed in Kubernetes 1.22.

### Halyard removed
Halyard is removed from the codebase as of this release. For emergency fixes, PRs can be made to the 2026.2.x release branch. Halyard will no longer be released or actively supported, though it may continue to work as we will continue publishing BOMs for now. As of 2027.0.0, we will stop publishing Halyard BOMs.

### Kustomize version 3 deprecated — will be removed in 2027.0.0
Kustomize V3 is deprecated. When using Kustomize in a pipeline, this is what's referenced when you select `KUSTOMIZE` as the rendering type. Kustomize 5 is being added, and Kustomize 4 will continue to be supported. With 2027.0.0, Kustomize 3 will be removed. Please upgrade your pipelines to Kustomize 4 or 5 before that release.

### SQL is the only supported storage for execution data — Redis will be removed in 2027.0.0
In Orca (the execution engine), we are deprecating support for any pipeline storage other than SQL. Please migrate your executions to SQL as soon as possible. Redis-based storage of pipeline execution state will be removed in 2027.0.0. Note: this only impacts storage of pipelines, not the queue system. It is recommended to stay on Redis for the queue system at this time.

### Titus deprecated — will be removed in 2027.0.0
Given the lack of contributions, the Titus cloud provider will be removed in an upcoming release. It is marked deprecated as of this release.

### SQL is the only supported storage for pipelines/templates — blob storage will be removed in 2027.0.0
Front50 currently supports S3/GCS/etc. storage for pipelines and templates. This will be removed in 2027.0.0. See the instructions [on how Netflix migrated](https://spinnaker.io/docs/setup/productionize/persistence/front50-sql/#migration) to move before that release. All non-SQL storage for Front50 is now marked deprecated.


## Features

### Configurable timeout on manifest stable checks
[Kubernetes manifest stable time](https://github.com/spinnaker/spinnaker/pull/7804) — Kubernetes deploys previously had a fixed 30-minute timeout before Deployments were considered "stable." This timeout is now configurable via a pipeline parameter.

### Multi-pipeline runner
[Multi-pipeline runner](https://github.com/spinnaker/spinnaker/pull/7803) — This plugin enables calling several child pipelines dynamically via a configuration block. For more information and configuration options, see the linked PR.

### New scheduler system (Alpha)
[Pub/Sub Cloud Account Scheduler](https://github.com/spinnaker/spinnaker/pull/7399) — A new scheduler that processes requests for caching and agent operations in order. The current Redis scheduler is non-deterministic about when agents are processed, so users with large numbers of accounts may not get their data processed in a timely manner. This new scheduler exposes endpoints, stores agent state, and surfaces more detailed metrics on agent executions.

To try it out, disable the current Redis scheduler and enable this via:
```yaml
spring:
  data:
    redis:
      url: redis://valkey:6379

cats:
  pubsub:
    enabled: true
    # Interval between state checks and re-queuing requests for additional processing.
    delayBetweenSchedulerRunsMs: 15000
    # When an agent is removed (e.g. account deletion), it is marked for deletion. This controls when it is actually removed. Time is in minutes. Defaults to 3 hours.
    minutesBeforeDeletingMarkedForDeletion: 180
    # If an agent hasn't been processed for some reason (e.g. lost in the queue), requeue it after this period.
    minutesBeforeReQueueOfAgents: 20
    # Strict concurrency limit on how many agents will run simultaneously. Similar to max-concurrent-agents in other schedulers.
    maxConcurrentAgents: 100
    # Max length of the Redis streams used for picking up agents to run. Set this large if you have many agents.
    # Rough estimate: every AWS account adds ~15 agents per region. 100 accounts × 4 regions × 15 = 6,000 agents minimum.
    # This defaults to 100,000. Note: this value directly affects Redis memory usage.
    streamMaxLength: 100_000
```

This is an initial step toward using streams to request information rather than polling on a fixed cycle, and enables future alternative agent operation strategies.

### Global banner for admins
[Global banner](https://github.com/spinnaker/spinnaker/pull/7781) — Admins can create and set banners visible across all Spinnaker applications for global notifications.

### Spin CLI API token support
The new API token can be used with the Spin CLI. This is available in current main images.

### UI support for adding/removing accounts
Admin-restricted. Adds a new UI panel to add and remove accounts with example payloads.


## Fixes

### PostgreSQL compression issue
[PostgreSQL compression failures](https://github.com/spinnaker/spinnaker/pull/7801) — When using PostgreSQL with Orca database compression, failures occurred due to library upgrades. This is now fixed.

### Large YAML support
[Large YAMLs could fail to load](https://github.com/spinnaker/spinnaker/pull/7811) — Following prior snakeyaml upgrades, some parts of Spinnaker did not allow customization of the maximum YAML size (for example, Helm repo indexes). These configurable limits are now universally applied.

### Fixed a bug on account APIs
In certain edge cases, newly created accounts would not be read or updated across all pods after creation. This is now fixed.
