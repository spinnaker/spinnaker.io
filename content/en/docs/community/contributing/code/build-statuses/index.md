---
title: 'Build Statuses'
linktitle: 'Build Statuses'
weight: 1

services:
  core:
    - clouddriver
    - deck
    # - deck-kayenta
    - echo
    - fiat
    - front50
    - gate
    - igor
    - kayenta
    - kork
    - orca
    - rosco
    - spinnaker-monitoring
  supporting:
    - halyard
    - keel
    - keiko
    - spin
    - spinnaker.github.io
    - spinnaker-gradle-project
    - swabbie

branches:
  - master
  - release-1.26.x
  - release-1.25.x
  - release-1.24.x
---

[Build Cop Rotation History](https://github.com/spinnaker/spinnaker/issues?utf8=%E2%9C%93&q=is%3Aissue+label%3Abuild-cop-rotation)

[Build Cop List of Responsibilities](../nightly-builds/#build-cop)

## Nightly and Release Integration Tests

> You must be a member of the `build-cops` GitHub Team to access nightly and release integration tests.
> {{< buildStatus >}}

## Core Services

{{< coreServices >}}

## Optional and Supporting Services

{{< supportingServices >}}
