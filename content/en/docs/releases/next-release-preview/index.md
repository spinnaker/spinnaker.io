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

``` 
[
    "successful_pipelines_count"  : <int>,
    "successful_pipelines"        : <List<String>>,
    "failed_pipelines_count"      : <int>,
    "failed_pipelines"            : <List<Map<String, Object>>> 
]
```
Here the value for `successful_pipelines` is the list of successful pipeline names whereas the value for `failed_pipelines` is the list of failed pipelines expressed as maps. 
