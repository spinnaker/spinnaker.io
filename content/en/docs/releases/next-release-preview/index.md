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

### Session data cleanup

Spring Boot 3.0 considers session data cached by Spring Boot 2.7 invalid.  Therefore, users with cached sessions will be unable to log in until the invalid information is removed from the cache. Open browser windows to Spinnaker are unresponsive after the deployment until they’re reloaded.
Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on Gate's redis instance removes the cached session information.


### YAML Parsing Limits Configuration

**Context:**
Starting with **SnakeYAML 1.33**, strict safety limits are enforced by default:

* `maxAliasesForCollections = 50`
* `codePointLimit = 3145728`

These limits can cause large or alias-heavy YAML files (such as Kubernetes manifests) to fail during parsing, potentially breaking Spinnaker deployments.

**Improvement:**
To address this, Spinnaker now exposes two configurable properties that allow operators to override these limits when needed:

```
snakeyaml.max-aliases-for-collections: <int>   # default: 50
snakeyaml.code-point-limit: <int>              # default: 3145728
```

**Impact:**

* Prevents deployment failures due to strict YAML parsing limits.
* Provides flexibility for environments using complex or deeply aliased YAML manifests.
* Defaults remain aligned with SnakeYAML 1.33’s secure settings.

**Example:**
To increase limits for large manifests:

```
snakeyaml:
  max-aliases-for-collections: 500
  code-point-limit: 10485760
```

reference links:
https://www.javadoc.io/doc/org.yaml/snakeyaml/1.33/org/yaml/snakeyaml/LoaderOptions.html
https://github.com/spinnaker/spinnaker/blob/main/kork/kork-core/src/main/java/com/netflix/spinnaker/kork/yaml/YamlHelper.java