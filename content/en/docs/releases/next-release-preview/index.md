---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.27

### Clouddriver

- Retry capability has been added for kubectl calls. This can be enabled by setting `kubernetes.jobExecutor.retries.enabled: true`. It is turned off by default.

  - Kubectl error strings on which retries should be performed can be configured using the `kubernetes.jobExecutor.retries.retryableErrorMessages` key. This key accepts a list of strings. The code does a `string.contains()` check on kubectl error messages - so only certain keywords from the original error message is enough to be added here. For example `TLS handshake timeout` is a valid retryable error message.

  - An example of the complete set of configuration options are defined below:
    ```
    kubernetes:
      jobExecutor:
        retries:
          enabled: true # (default: false)
          maxAttempts: 3 # (default: 3)
          backOffInMs: 5000 # (default: 5000)
          exponentialBackoffEnabled: false # (default: false)
          exponentialBackoffMultiplier: 2 # (default: 2)
          exponentialBackOffIntervalMs: 1000 # (default: 1000)
          retryableErrorMessages: # list of error strings
            - TLS handshake timeout
    ```

- The sharding configuration properties used for sql based implementation are updated to make it consistent with redis based implementation. Now, the following configuration applies to both the implementations.
  ```
  cache-sharding:
    enabled: true
    replicaTtlSeconds: 60  //current timestamp plus this value makes the ttl for the pod's heartbeat record, default is 60
    heartbeatIntervalSeconds: 30 //interval to refresh heartbeat records, default is 30
  ```
- Ability to convert EC2 server groups backed by launch template to use [mixed instances policy](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#additional-features). [Here](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#convert-a-server-group-with-launch-template-to-use-mixed-instances-policy-with-multiple-instance-types-and-capacity-weighting) is a sample API request.

### Orca

- Front50 tasks such as UpsertApplication and DeleteApplication now implement the RetryableTask interface, thereby allowing the user to add a configurable timeout and backoff for these tasks. The configurable values are:

  ```
  tasks:
    upsert-application:
      backoff-ms: 10s (default: 10s)
      timeout-ms: 1 hr (default)
    delete-application:
      backoff-ms: 10s (default)
      timeout-ms: 1 hr (default)
  ```

- Orca can now be configured to use shared managed service accounts. Unlike managed service accounts, which are created per pipeline, these are generated per unique combination of roles. This can significantly reduce the number of service accounts that Fiat needs to process during role sync and real-time auth calls, which can lead to errors when saving new pipelines or authenticating user requests if the sync or auth is slow enough. This introduces a new configurable option, `useSharedManagedServiceAccounts`, which defaults to false:

  ```
  orca:
    tasks:
      useSharedManagedServiceAccounts: true
  ```

- Added the capability to use pipeline expressions within ECS task definition Artifacts. You can enable this by setting `evaluateTaskDefinitionArtifactExpressions: true`. Task definition artifacts can have pipeline expressions that are evaluated at run time. The Pipeline expression has `${expression here}` syntax. Here is an example of the Pipeline expression evaluation:

  {{< figure src="Screen_Shot_for_override_task_defintion_using_SpEL.png" caption="<center>Override Task Definition Using SPEL</center>" alt="Override Task Definition Using SPEL">}}

### Deck

- A new property called `apiTimeoutMs` has been added to the configurable settings. This property specifies what the timeout should be when Deck makes API calls to other microservices. This property is not a required property.
- Support for configuring [EC2 Auto Scaling Capacity Rebalancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-capacity-rebalancing.html) under [Advanced Settings](https://github.com/spinnaker/deck/pull/9369).

### Front50

- Front50 now supports migrations to migrate from managed service accounts to shared managed service accounts. [Check out the PR of the feature for an example of using the new migrations](https://github.com/spinnaker/front50/pull/1022). This introduces two new configurable options:
  ```
  front50:
    migrations:
      migrateToSharedManagedServiceAccounts: true
      deleteDanglingManagedServiceAccounts: true
  ```

### Spinnaker Monitoring Daemon Deprecated

The Spinnaker monitoring daemon has been deprecated and is unmaintained.
Container images and debian artifacts for existing version remain available but
no new versions are being built. Users are encouraged to migrate to the Armory
Observability Plugin that is more performant and simpler to operate.

See the [Monitoring Setup Guide](https://spinnaker.io/docs/setup/other_config/monitoring/).
