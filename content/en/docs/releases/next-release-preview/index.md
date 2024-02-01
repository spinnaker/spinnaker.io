---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.34

https://github.com/spinnaker/orca/pull/4620 introduces a new feature to compress
pipeline executions stored in sql using these new config flags:

```
execution-repository:
  sql:
    compression:
      enabled: true # defaults to false
      compressionMode: read-write # read-only also valid, defaults to read-write
      bodyCompressionThreshold: 1024 # bytes above which compression happens
      compressionType: "ZLIB" # GZIP also valid, defaults to ZLIB
```
