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

- Retry capability has been added for kubectl calls. This can be enabled by setting  `kubernetes.jobExecutor.retries.enabled: true`. It is turned off by default.
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

### Orca

- Front50 tasks such as UpsertApplication and DeleteApplication now implement the RetryableTask interface, thereby allowing the user to add a configurable timeout and backoff for these tasks. The configurable values are:
    ```
    tasks:
      upsert-application:
        backoff-ms : 10s (default: 10s)
        timeout-ms: 1 hr (default)
      delete-application:
        backoff-ms : 10s (default)
        timeout-ms: 1 hr (default)
    ```

### Deck

- A new property called `apiTimeoutMs` has been added to the configurable settings. This property specifies what the timeout should be when Deck makes API calls to other microservices. This property is not a required property.
