---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2025.4.0


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

