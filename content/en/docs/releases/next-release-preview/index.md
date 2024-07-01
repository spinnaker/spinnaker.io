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

## RetrofitExceptionHandler Removed

https://github.com/spinnaker/orca/pull/4716 removed RetrofitExceptionHandler from orca.  There's an ongoing effort to upgrade to retrofit2.  One step along the way is to adjust error handling code based on RetrofitError (a retrofit1 class not available in retrofit2) to use [SpinnakerServerException](https://github.com/spinnaker/kork/blob/v7.231.0/kork-retrofit/src/main/java/com/netflix/spinnaker/kork/retrofit/exceptions/SpinnakerServerException.java) and its children, by using [SpinnakerRetrofitErrorHandler](https://github.com/spinnaker/kork/blob/v7.231.0/kork-retrofit/src/main/java/com/netflix/spinnaker/kork/retrofit/exceptions/SpinnakerRetrofitErrorHandler.java#L52).  That's been done in orca, so there isn't any code left to throw RetrofitError exceptions.  If your instance of Spinnaker has plugins or other code that still does throw RetrofitError, adjust it to use SpinnakerRetrofitErrorHandler by adding, e.g.:


    .setErrorHandler(SpinnakerRetrofitErrorHandler.getInstance())

to the RestAdapter.Builder call.  See [here](https://github.com/spinnaker/orca/blob/9898ae1a673f0481abe082f4b681dbc314682c3f/orca-front50/src/main/groovy/com/netflix/spinnaker/orca/front50/config/Front50Configuration.groovy#L82) for an example.

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
