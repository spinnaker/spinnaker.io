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

### Front50

https://github.com/spinnaker/front50/pull/1275 adds the `sql.healthIntervalMillis` property that controls the interval to refresh information that the /health endpoint provides.  It defaults to 30 seconds, the value before it was configurable.

### Artifact Store

https://github.com/spinnaker/kork/pull/1069 adds support for artifact storage with AWS S3. This compresses `embedded/base64` types to `remote/base64` reducing the artifact size in the context. The size of the context had a reduction of 70% for larger pipelines, and 30% for smaller pipelines.

Sample configuration to enable artifact storage
```yaml
# spinnaker-local.yml since clouddriver, rosco, and orca all need this configuration
artifact-store:
  enabled: true
  s3:
    enabled: true
    region: us-west-2
    bucket: some-artifact-store-bucket
```

Other related PRs are:
https://github.com/spinnaker/clouddriver/pull/5976
https://github.com/spinnaker/deck/pull/10011
https://github.com/spinnaker/orca/pull/4481
https://github.com/spinnaker/rosco/pull/998

For more information please see the README, https://github.com/spinnaker/kork/blob/master/kork-artifacts/src/main/java/com/netflix/spinnaker/kork/artifacts/README.md
