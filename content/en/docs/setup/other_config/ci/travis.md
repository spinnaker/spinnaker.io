---

title:  "Travis CI"
description: Spinnaker supports Travis as a continuous integration system.
---

You can configure Spinnaker to use [Travis
CI](https://travis-ci.org/) as your Continuous Integration
system, trigger pipelines with Travis, or add a Travis stage to a pipeline.

## Prerequisites

* You need a Travis user with an [API access
token](https://docs.travis-ci.com/api/#authentication) so that you get only the
repos you should see.

* That user needs adequate access in GitHub to trigger builds.

## Add your Travis CI master

1. Enable Travis CI in `igor-local.yml`
```yaml
travis:
  enabled: true
  masters:
  - name: someName
    baseUrl: https://travis-ci.com
    ## Address IS Required but MAY not be actually used anymore
    address: https://api.travis-ci.com
    githubToken: patUse
    numberOfJobs: number to poll for each cycle
```
It is recommended to use [encrypted secrets](/docs/reference/secrets/) for password information in the above

For more configuration options, see the [travis configuration properties](https://github.com/spinnaker/spinnaker/tree/main/igor/igor-monitor-travis/src/main/java/com/netflix/spinnaker/igor/travis/config/TravisProperties.java) in igor.