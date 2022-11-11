---
title: "CI"
linkTitle: "CI"
weight: 25
description: Spinnaker can listen to events and collect artifacts produced by external Continuous Integration (CI) systems.
---

Spinnaker can listen to events, and collect artifacts produced by builds in
external Continuous Integration (CI) systems. These events can trigger
Pipelines, and the artifacts can be used by Spinnaker's image bakery to produce
machine images. 

For example, the [Source to
Prod](/docs/guides/tutorials/codelabs/gce-source-to-prod/) codelab configures a
Jenkins Job to produce a Debian package as an artifact that is handed to
Spinnaker to build a VM image which Spinnaker deploys.

Currently, Spinnaker supports several CI systems which can be enabled and run
independently of one-another, enumerated below.

## Supported CI systems

These are the CI systems currently supported by Spinnaker:

* [AWS CodeBuild](/docs/setup/other_config/ci/codebuild/)
* [Google Cloud Build](/docs/setup/other_config/ci/gcb/)
* [Jenkins](/docs/setup/other_config/ci/jenkins/)
* [Travis CI](/docs/setup/other_config/ci/travis/)

See also [hal config ci](/docs/reference/halyard/commands/#hal-config-ci).
