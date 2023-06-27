---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.32

### Java 17

Front50 and Igor containers now default to running with the Java 17 JRE. In an upcoming release (likely 1.33) all other services will default to the Java 17 JRE. If you encounter issues with these containers you can opt-out and use the Java 11 JRE containers. Users of Halyard can do this by specying `imageVariant: java11-slim` or `imageVariant: java11-slim-ubuntu` in their halconfig.

Please report any problems by creating a GitHub issue [here](https://github.com/spinnaker/spinnaker/issues/new). You can read more about the Java 17 migration plan [here](https://github.com/spinnaker/governance/pull/335).

### Gradle 7

Builds have been upgraded from Gradle 6 to Gradle 7. We do not anticipate any issues with this upgrade. Plugin developers are encouraged to upgrade to Gradle 7 to ensure compatibility.

### Fiat

https://github.com/spinnaker/fiat/pull/1058 adds support for handling DN based multiloading of roles. Adds pagination support while fetching group memberships. Support for user IDs to user DNs mapping provided using batched LDAP queries. 

This is an opt-in feature using the below configuration: 
```yaml
auth:
  groupMembership:
    ldap:
      enableDnBasedMultiLoad: true
```

To enable pagination, below configuration is also needed:
```yaml
auth:
  groupMembership:
    ldap:
      enablePagingForGroupMembershipQueries: true
```


https://github.com/spinnaker/fiat/pull/1060 allows skipping additional details of applications fetched from Front50 and clouddriver while caching the UserPermission.

Below configuration enables this feature:
```yaml
resource:
  provider:
    application:
      suppressDetails: true
```
