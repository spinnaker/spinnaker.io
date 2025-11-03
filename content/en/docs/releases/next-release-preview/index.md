---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2025.3.0


### Spring Boot 3.0.13 Upgrade

As part of the upgrade to Spring Boot 3.0.13, actuator metrics export configuration properties have changed structure.

#### Actuator Metrics Export Property Changes

The metrics export properties have moved from the old schema to the new format:

| Old Property Prefix | New Property Prefix |
|---------------------|---------------------|
| `management.metrics.export.<product>` | `management.<product>.metrics.export` |

**Example**

Prometheus configuration keys have changed from:

```properties
management.metrics.export.prometheus.*

to

management.prometheus.metrics.export.*
```

### Session data cleanup

Spring Boot 3.0 considers session data cached by Spring Boot 2.7 invalid.  Therefore, users with cached sessions will be unable to log in until the invalid information is removed from the cache. Open browser windows to Spinnaker are unresponsive after the deployment until they’re reloaded.
Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on Gate's redis instance removes the cached session information.


