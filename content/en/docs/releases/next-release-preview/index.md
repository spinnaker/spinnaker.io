---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.35

Version 1.31 of Spinnaker introduced two features that were disabled by default:

[echo: pipelineCache.filterFront50Pipelines](https://spinnaker.io/changelogs/1.31.0-changelog/#echo)

[orca: front50.useTriggeredByEndpoint](https://spinnaker.io/changelogs/1.31.0-changelog/#orca)

Both of these features are now enabled by default.

### Spring Boot 2.7.18

As part of the continued effort to upgrade Spring Boot, Spinnaker 1.35.0 now uses Spring Boot 2.7.18, an upgrade from Spinnaker 1.34.0`s use of Spring Boot 2.6.15. Spring Boot 2.7 considers session data cached by Spring Boot 2.6 invalid.  Therefore, users with cached sessions will be unable to log in until the invalid information is removed from the cache. Open browser windows to Spinnaker are unresponsive after the deployment until they’re reloaded.
Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on Gate's redis instance removes the cached session information.


Spring Boot 2.7 brings with it the following changes:

* Groovy upgrade from 3.0.17 to 3.0.19
* Replaces mysql connector coordinate from `mysql:mysql-connector-java` to `com.mysql:mysql-connector-j` with version 8.0.33.
* Changes to Auto-configuration

## Label Selector Support in Deploy Manifest Stages

https://github.com/spinnaker/clouddriver/pull/6220 adds support for label selectors in deploy manifest stages.  For example:

```
"labelSelectors": {
  "selectors": [
    {
      "kind": "EQUALS",
      "key": "my-label-key",
      "values": [
        "my-value"
      ],
    }
  ]
}
```

See https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/ and [KubernetesSelector](https://github.com/spinnaker/clouddriver/blob/ad1a8efc214264276e3a22d30af179b825145cab/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/security/KubernetesSelector.java#L59) for more. Multiple selectors combine with AND (i.e. must all be satisfied).

Note that `kubectl replace` doesn't support label selectors, so KubernetesDeployManifestOperation throws an exception if a deploy manifest stage that specifies (non-empty) label selectors has a manifest with a `strategy.spinnaker.io/replace: "true"` annotation.

It's possible that none of the manifests may satisfy the label selectors. In that case, a new pipeline configuration property named `allowNothingSelected` determines the behavior. If false (the default), KubernetesDeployManifestOperation throws an exception. If true, the operation succeeds even though nothing was deployed.

### Feature Flag: SQL PipelineRef

#### Orca
- Orca introduced a feature flag in its 1.35 release aimed at reducing execution size by converting PipelineTrigger to PipelineRefTrigger:
    ```
    executionRepository:
      sql:
        enabled: true
        pipelineRef:
            enabled: true
    ```
  For details on the changes, please visit [this link](https://github.com/spinnaker/orca/pull/4749)
- PipelineRefTrigger now stores only the executionId instead of the entire execution context.
- When retrieving, we locate the parentExecutionId in PipelineRefTrigger to obtain the complete context.
- If the feature flag is disabled, executions containing pipelineRef will be processed as usual.
- Barring any issues discovered in this release, the flag will be removed, and the behavior will become default in an upcoming release.