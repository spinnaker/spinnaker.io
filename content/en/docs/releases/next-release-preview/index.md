---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.0.0

### Clouddriver

https://github.com/spinnaker/spinnaker/pull/7356 adds a way to configure artifact support in clouddriver at build time to reduce image size and dependencies.  Previously, support for all artifact types was included in clouddriver, with config flags to enable individual types (e.g. `artifacts.bitbucket.enabled`, `artifacts.gcs.enabled`, `artifacts.github.enabled`, etc.).  This PR introduces a new gradle property: `artifactTypes` that defaults to include all artifact types at build time:
```
artifactTypes=bitbucket,custom,docker,embedded,front50,gcs,github,gitlab,gitrepo,helm,http,ivy,jenkins,kubernetes,maven,oracle,s3
```
Change the value of artifactTypes to include a subset.  Note that the kubernetes cloud provider uses kubernetes artifacts.  So, if the kubernetes cloud provider is enabled, kubernetes artifacts are included even if kubernetes isn't present in artifactTypes.  Similarly for the cloudfoundry cloud provider and maven artifacts.
