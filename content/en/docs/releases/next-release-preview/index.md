---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.28

### Clouddriver

- There are a number of changes to reduce clouddriver's startup time:
  * [don\'t load namespaces in k8s accounts](https://github.com/spinnaker/clouddriver/pull/5515) (with kubernetes.loadNamespacesInAccount: false)
  * [parse aws accounts in multiple threads](https://github.com/spinnaker/clouddriver/pull/5539) (with aws.loadAccounts.multiThreadingEnabled: true)
  * [cache regions when parsing aws accounts](https://github.com/spinnaker/clouddriver/pull/5532)

- The sharding configuration properties used for sql based implementation are updated to make it consistent with redis based implementation. Now, the following configuration applies to both the implementations.
  ```
  cache-sharding:
    enabled: true
    replicaTtlSeconds: 60  //current timestamp plus this value makes the ttl for the pod's heartbeat record, default is 60
    heartbeatIntervalSeconds: 30 //interval to refresh heartbeat records, default is 30
  ```

- Ability to convert EC2 server groups backed by launch template to use [mixed instances policy](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#additional-features). [Here](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#convert-a-server-group-with-launch-template-to-use-mixed-instances-policy-with-multiple-instance-types-and-capacity-weighting) is a sample API request.

- https://github.com/spinnaker/clouddriver/pull/5638 modifies the default behavior of the kubernetes provider from caching all infrastructure, to caching only objects shown in the classic spinnaker infrastructure screens (clusters, load balancers and firewalls).  It introduces these configuration properties
  ```
  kubernetes:
    cache:
      enabled: (true|false)   # (Default: true). Whether caching is enabled at the provider level.
      cacheAll: (true|false)  # (Default: false). Whether to cache all kubernetes kinds or not. If this value is "true", the setting "cacheKinds" is ignored.
      cacheKinds: []          # (Default: list with kinds populating spinnaker infrastructure screen). Only cache the kubernetes kinds in this list. Names are in {kind.group} format, where the group is optional for core kinds. If the setting cacheAll is true, this setting is ignored.
      cacheOmitKinds: []      # (Default: empty). Do not cache the kinds in this list. The format of the list is the same as cacheKinds.
  ```
   The default list of kinds to cache comes from [KubernetesCachingAgent.SPINNAKER\_UI\_KINDS](https://github.com/spinnaker/clouddriver/blob/release-1.28.x/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/caching/agent/KubernetesCachingAgent.java#L66).

   With the default settings, no action is needed when upgrading to a new version of Spinnaker. Pipelines will continue to work, as well as the UI screens for clusters, load balancers and firewalls. Only for users working with the raw resources screen, they would need to set kubernetes.cache.cacheAll: true to continue using it.

- improve error reporting in the UI for kubernetes run job stages.  See https://github.com/spinnaker/clouddriver/pull/5184 for details.

- version 1.23 of spinnaker introduced a [breaking change](https://spinnaker.io/changelogs/1.23.0-changelog/#user-content-breaking-change-spinnaker-kubernetes-manifest-image-overwriting-with-a-bound-artifact) to the way binding of docker images with tags worked.  https://github.com/spinnaker/clouddriver/pull/5513 restores the pre-1.23 behavior with the following configuration:
  ```
  kubernetes:
  artifact-binding:
    docker-image: match-name-only
  ```
  With `match-name-only`, docker images with tags aren't replaced.
