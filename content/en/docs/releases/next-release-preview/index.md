---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.31

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

This feature introduces a new SpEL `doNotEval` method that includes the received JSON object with the NotEvaluableExpression class.
The toJson method (and others in the future) will not evaluate expressions and will not throw exceptions for instances of the NotEvaluableExpression class.
- The feature flag introduced in Kork (1.28/29 releases) to use `doNotEval` SPeL expression helper will be enabled by default.
- This feature is disabled only when the flag is set explicitly to false.

  ```yaml
    # orca-local.yml
  
  expression:
    do-not-eval-spel:
      enabled: false
  ```
See the changes [here](https://github.com/spinnaker/kork/pull/978)

