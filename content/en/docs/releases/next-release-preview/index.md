---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.1.0

### Kubernetes secret engine support
A new feature allows you to store and reference secrets from kubernetes.  You can now save a secret and use it in a 
spinnaker configuration using the encrypted syntax similar to that for s3 or other services.
```
encrypted:k8s!n:somesecretName!k:secretKey
```
If you want to enable this, add to your spinnaker-local.yml (the default config file in spinnaker-kustomize) the
following config:
```
spinnaker:
  secrets:
    kubernetes:
      enabled: true
```
This will use the local pod credentials for accessing secrets.  You can also use a secret in a different namespace if your
spinnaker is authorized to do so with an ns flag.  See https://github.com/spinnaker/spinnaker/pull/7603/changes for more
information.

### Lambda Naming and performance fixes
Lambda had some issues around loading all lambdas into memory when enabled then filtering.  The new release with
some configuration changes this to operate similarly to ECS and Kubernetes with tags added to the lambda
that enable filtering by tags.  Further, this moves caching out of the shared application to a dedicated
lambda application table.  This should drastically improve lambda experience across the board.  The tags behavior 
is enabled by default and all new deploys will automatically add these tags on deployment.  You can disable this
behavior by changing the following in clouddriver:

```
aws:
  lambda:
    setMonikerTags: false
```
Next, to allow arbitrary naming of functions without a default prefix on deployments, you can disable by a flag
the spinnaker behavior of adding this.  Note there are two configurations, one in orca and one in clouddriver.

Clouddriver:
```
aws:
  lambda:
    prefixApplicationNameToFunction: false
```

Orca:
```
lambda:
  prefixApplicationNameToFunction: false
```
This will allow you to using an expression edit the stage json and set any name you wish other than the UI generated
function name.


### Fiat performance fixes
A couple of PRs that fix some major performance issues in fiat.
1.  The locking mechanism was restored but fixed the issues reported in https://github.com/spinnaker/spinnaker/issues/7339
2.  The sync process does a parallel write and read of data.  https://github.com/spinnaker/spinnaker/pull/7648

For configuration the parallel write when using redis, add the following to adjust this.
```
fiat:
  redis:
    repository:
      sync-threads: 16   # default: Runtime.getRuntime().availableProcessors()
```

For the lock behavior there are two places to configure the recommended settings:
1.  Fiat:
```
# Fiat – enable cross-pod sync coordination
fiat:
  write-mode:
    enabled: true
    synchronization-config:
      enabled: true
      prefix: "spinnaker:fiat"
    sync-delay-ms: 600000
    sync-failure-delay-ms: 600000
    sync-delay-timeout-ms: 30000
    retry-interval-ms: 10000
```
2.  Front50
```
# Front50 – avoid full sync (and locks) when saving service accounts
fiat:
  disableRoleSyncWhenSavingServiceAccounts: true
```

These in combination should help reduce the number of sync times and improve overall fiat performance.  In some testing, we've seen this configuration reduce
sync time from hours to minutes.
