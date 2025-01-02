---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.37

### Orca
With https://github.com/spinnaker/orca/pull/4804, the api `/applications/{application}/pipelines?expand=false&limit=2` performance is improved when using sql as the backend. 
Orca's queries to its sql db are optimized while handling the data obtained from front50.
TaskController is refactored to support externalized config properties.

#### Breaking changes:
These configuration properties:
```yaml
tasks:
   days-of-execution-history:  
   number-of-old-pipeline-executions-to-include: 
```
are replaced by the below configuration along with few more newly added ones:
```yaml
tasks:
   controller:
      days-of-execution-history: 
      number-of-old-pipeline-executions-to-include: 

      optimize-execution-retrieval: <boolean>
      max-execution-retrieval-threads:
      max-number-of-pipeline-executions-to-process: 
      execution-retrieval-timeout-seconds: 
```



