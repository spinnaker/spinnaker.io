---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.30

### Spring Boot 2.3

Spinnaker 1.30 uses Spring Boot 2.4, where 1.29 uses Spring Boot 2.3.  Spring
Boot 2.4 considers session data cached by Spring Boot 2.3 invalid.  Therefore,
users with cached sessions will be unable to log in until the invalid
information is removed from the cache.  Open browser windows to Spinnaker are
unresponsive after the deployment until they’re reloaded.  Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on Gate's redis instance removes the cached session information.

### doNotEval SpEL helper

The `doNotEval` SpEL helper makes it possible to skip SpEL evaluation in other SpEL helpers e.g. `toJson`.

For example, if the evaluation context is defined only `fileMap` object:

```java
Map<String, Object> fileMap = Collections.singletonMap("owner", "managed-by-${team}");
```

An exception will be thrown in attempt to get JSON because of `fileMap` contains SpEL inside.

```shell
${#toJson(fileMap)}
```

In the given case `fileMap` contains SpEL for another tool e.g. Terraform. Use `doNotEval` to let Spinnaker know
that this SpEL should be evaluated by a different tool. No exceptions are thrown this way.

```shell
${#toJson(#doNotEval(fileMap))}
```

Use a feature flag to enable.

```yaml
# orca-local.yml

expression:
  do-not-eval-spel:
    enabled: true
```
