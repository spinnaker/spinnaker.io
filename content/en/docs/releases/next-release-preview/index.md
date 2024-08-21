---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.36

### Enhanced pipeline batch update feature

Batch update operation is now atomic. Deserialization issues are addressed. 

Configurable controls are added to decide whether cache should be refreshed while checking for duplicate pipelines:
```yaml
controller:
   pipeline:
      save:
         refreshCacheOnDuplicatesCheck: false // default is true 
```

Batch update call now responds with a status of succeeded and failed pipelines info. The response will be a map containing information in the following format:

It's possible that none of the manifests may satisfy the label selectors. In that case, a new pipeline configuration property named `allowNothingSelected` determines the behavior. If false (the default), KubernetesDeployManifestOperation throws an exception. If true, the operation succeeds even though nothing was deployed.

``` 
[
    "successful_pipelines_count"  : <int>,
    "successful_pipelines"        : <List<String>>,
    "failed_pipelines_count"      : <int>,
    "failed_pipelines"            : <List<Map<String, Object>>> 
]
```
Here the value for `successful_pipelines` is the list of successful pipeline names whereas the value for `failed_pipelines` is the list of failed pipelines expressed as maps. 


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
- When enabled, child pipeline execution ids are stored in sql instead of the entire child pipeline execution context.  
- The in-memory representation of pipelines doesn't change whether this feature is enabled or not.  As well, pipelines stored with child pipeline execution ids are processed properly when the feature is disabled.
- Barring any issues discovered in this release, the flag will be removed, and the behavior will become default in an upcoming release.
