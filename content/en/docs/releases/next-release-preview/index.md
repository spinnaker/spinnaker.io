---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.3.0

## Features
#### Global banner for admins
[Global banner](https://github.com/spinnaker/spinnaker/pull/7781) -  Admins can create/set banners that ALL spinnaker apps will see for global notifications.

#### Spin CLI API token support
This is accessible today via main images but you can use the new API token with the spin cli.

#### UI support for adding/removing accounts
Admin restricted, adds a new UI panel to add/remove accounts with example payloads.


## Fixes
#### Fixed a bug on account APIs
This is an edge case, but in certain situations, new accounts would not be read/updated on all pods post account creation.  


## Deprecations and removals

#### Old kubernetes resource types are removed
[VERY old API specs are removed](https://github.com/spinnaker/spinnaker/pull/7802/changes).  Specifically:
* extensions/v1beta1 
* networking.k8s.io/v1beta1
and associated libraries for kuberentes are also upgraded to a current supported release of these specifications.  This removes any of the following type resources - please update your plugins as appropriate as these VERY old manifests will no longer work.  These were removed in kubernetes 1.22 and handling for these old API specs as well as associated resources are removed.

#### Halyard is removed
Halyard is removed from the codebase as of this release.  For emergency fixes/issues, we can do PRs to the 2026.2.x release branch.  Otherwise, halyard is no 
longer going to be released or supported.  It likely will continue to work as we will for now continue to publish BOMs.  As of 2027.0.0, we will stop
publishing the halyard BOMs.

#### Kustomize version 3 deprecated, will be removed in 2027.0.0
Kustomize V3 is deprecated. When using kustomize in a pipeline this is what's referenced when you select KUSTOMIZE for the rendering type.  KUSTOMIZE5 is being
added, and 4 will continue to be added.  With 2027.0.0, kustomize 3 will be removed and no longer an option in the project.  Please upgrade to kustomize4/5 on your pipelines
before upgrading in the future.  

#### SQL is the only supported storage for execution data - redis will be removed in 2027.0.0
In Orca - the execution engine - we are deprecating support for any pipeline storage OTHER than SQL.  Please move your executions to SQL as soon as possible.  Redis
based storage of pipeline execution state will be removed in 2027.0.0.  NOTE:  This only impacts STORAGE of pipelines NOT the queue system.  It's recommended
to stay on redis for the queue system at this time.

#### Titus is deprecated and will be removed in 2027.0.0
Given the lack of contributions, we'll be removing the titus cloud provider from the project in the upcoming release.  We are marking it deprecated at this time.

#### SQL is the only supported storage for pipeline/templates - blob storage will be removed in 2027.0.0
Currently front50 supports S3/GCS/etc. storage for pipelines and templates.  This will be removed in 2027.0.0.  Please see the instructions
[on how netflix migrated](https://spinnaker.io/docs/setup/productionize/persistence/front50-sql/#migration) to move before these releases.
At this time, we are marking all NON SQL STORAGE deprecated for front50.  This should simplify upgrades and front50 as a whole for the project once completed.

#### Core utility upgrades:
* Kustomize 5 is added.  Kustomize4 is updated to the latest supported versions.
* Helmfile is upgraded to 1.7.0
* Packer is upgraded to the latest release (1.14).
* Kubectl binaries used for operations is updated to 1.30.  Older versions are removed.  You can select a newer version.
* aws-iam-authenticator binary is upgraded to the latest supported version
* Base images are upgraded from 3.20 to 3.24 of alpine.  Ubuntu is moved to the latest releases.


