---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.33

### Lambda changes

In 1.33, several changes were made to allow full exposure of Lambda timeouts to operations.  Previously the SDK would restrict timeouts despite any configuration to 55 seconds - you can now change this for things like long running lambda invocations.  Further the duplicate retry behavior (between custom retry code and SDK retry behavior) has been removed entirely in favor of SDK retry behavior.  This means pipeline retries no longer work at this time.  Future enhancements could restore custom retry per operation configurations.  To set retries and timeouts for Lambda operations you can set a clouddriver profile like so:
```
aws:
  features:
    lambda:
      enabled: true
  lambda:
    invokeTimeoutMs: 4000000
    retries: 1
```
See PR for more information: https://github.com/spinnaker/clouddriver/pull/6077

### Java 17

Following the changes to use JRE 17 for Front50 and Igor in [1.32](/changelogs/1.32.0-changelog), all other services (Clouddriver, Orca, Gate, Echo, Fiat, Rosco, and Kayenta) have now been upgraded. Java 11 variants of all services continue to be published. Please report any problems by creating a GitHub issue. 

In future releases, services will be gradually updated to compile using JDK 17 in order to complete the migration to Java 17.

### Artifact Store

- https://github.com/spinnaker/kork/pull/1120 changes the configuration flags for the artifact store.  Before this PR, the way to enable the artifact store for s3 was:
```
artifact-store:
  enabled: true
  s3:
    enabled: true
    region: <region>
    bucket: <bucket>
```
After this PR, the way to enable both stores to and gets from s3 is:
```
artifact-store:
  type: s3
  s3:
    enabled: true
    region: <region>
    bucket: <bucket>
```
To enable gets only, but not stores:
```
artifact-store:
  type: s3
  s3:
    enabled: false
    region: <region>
    bucket: <bucket>
```
This makes it possible to disable storage of new artifacts, while retaining the ability to process existing artifact store references.

### Deck

- https://github.com/spinnaker/deck/pull/10036 adds support to deploy different versions of artifacts based on the target cluster API and Kubernetes version, significantly improving the user experience when deploying Helm charts.
- To enable this feature, you must set `API_VERSIONS_ENABLED` to `true` in Deck.

  For configuration, see [Deploy Helm Charts]({{< ref "docs/guides/user/kubernetes-v2/deploy-helm" >}}).

Other related PRs are:
https://github.com/spinnaker/orca/pull/4546
https://github.com/spinnaker/rosco/pull/1020

### Groovy 3

All Groovy based implementations and tests have been upgraded to use Groovy 3 in place of Groovy 2. Supporting Spock test framework has been upgraded from 1.3-groovy-2.5 to 2.0-groovy-3.0. Removed the support of junit-vintage-engine. Groovy dependency has been unpinned and bring version from Spring Boot dependencies transitively. 

### Spring Boot 2.5.15
As part of the continued effort to upgrade Spring Boot, Spinnaker 1.33.0 now uses Spring Boot 2.5.15, an upgrade from Spinnaker 1.32.0's use of Spring Boot 2.5.14.

### Kotlin 1.5
In order to sync and upgrade the compatible version of Kotlin with Spring Boot, Kotlin based implementations and tests have been upgraded to use Kotlin 1.5.32 in place of 1.4.32. Now Spinnaker 1.33.0 uses this version for all services.
