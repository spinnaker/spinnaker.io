---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.34

https://github.com/spinnaker/orca/pull/4644 introduces a new feature to retry
kubernetes DeployManifestTask tasks if clouddriver itself is running in
kubernetes, and the cloudriver pod handling the task dies before it's complete.
The following configuration flags (and their defaults) control the behavior of
this new feature:
```
tasks.monitor-kato-task.kubernetes.deploy-manifest:
  retry-task.enabled: false
  maximum-period-inactivity-ms: 300000L
  maximum-forced-retries: 3
  account: "" # the name of the account where clouddriver runs, required if enabled is true
  namespace: spinnaker
```

https://github.com/spinnaker/orca/pull/4620 introduces a new feature to compress
pipeline executions stored in sql using these new config flags:

```
execution-repository:
  sql:
    compression:
      enabled: true # defaults to false
      compressionMode: read-write # read-only also valid, defaults to read-write
      bodyCompressionThreshold: 1024 # bytes above which compression happens
      compressionType: "ZLIB" # GZIP also valid, defaults to ZLIB
```

### (Breaking change) Springfox 3.0.0

API documentation implementing swagger has been upgraded to use Springfox 3.0.0.

Breaking Change:
Swagger-ui endpoint changed from `/swagger-ui.html` to `/swagger-ui/index.html`.


### Spring Boot 2.6.15

As part of the continued effort to upgrade Spring Boot, Spinnker 1.34.0 now uses Spring Boot 2.6.15, an upgrade from Spinnaker 1.33.0`s use of Spring Boot 2.5.15. Spring Boot 2.6 considers session data cached by Spring Boot 2.5 invalid.  Therefore, users with cached sessions will be unable to log in until the invalid information is removed from the cache. Open browser windows to Spinnaker are unresponsive after the deployment until they’re reloaded. Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on Gate's redis instance removes the cached session information.


### Spring Cloud 2021.0.8 (Jubilee)

As per the compatibility matrix of Spring Cloud Release document, Spring Boot 2.6.x and 2.7.x supports Spring Cloud 2021.0.

https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions#supported-releases

In order to use compatible Spring Cloud version along with Spring Boot, upgrade Spring Cloud from 2020.0.6 used in Spinnaker 1.33.0 to 2021.0.8 as part of Spinnaker 1.34.0. 


### Kotlin 1.6
In order to sync and upgrade the compatible version of Kotlin with Spring Boot, Kotlin based implementations and tests have been upgraded to use Kotlin 1.6.21 in place of 1.5.32. Now Spinnaker 1.34.0 uses this version for all services.


### UPCOMING BREAKING CHANGE:

kubectl in the latest releases has removed support for external auth flows using the `apiVersion: client.authentication.k8s.io/v1alpha1` exec API.  1.34 includes an aws cli (version 1.24) which supports both old and new exec api versions.  Additionally the aws-iam-authenticator binary also supports both exec api versions.   1.34 is the last release that will support v1alpha1 exec APIs in kubeconfig files.  Please update your kubeconfig files to use the v1beta1 api version.  Please see the upcoming [PR that will remove support for these after this release.](https://github.com/spinnaker/clouddriver/pull/6156)
