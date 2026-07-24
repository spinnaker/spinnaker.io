---
layout: single
title:  "Roadmap"
sidebar:
  nav: community
---

## Project Roadmap

## Enhancements in upcoming releases without a schedule
These improvements could happen at ANY time in any of the releases.  We'd welcome input on additional features that people would like to see from the project!
* Add a native MCP endpoint.  There's a few publicly available MCP servers, but having one natively supported would be ideal
* UI to add/remove accounts.  Make dynamic accounts a "default".  This support was added back in 1.28 and enhanced at various times, but we'd like to fully enable AND default this support to on
* Replace the "kubectl" based execution of kubernetes operations to native kubernetes SDK operations.  
* AWS Lambda to async for invocations.  Currently lambda operations (primarily invocations) are "SYNCHRONOUS" calls.  The plan is to change these to an ASYNC which captures the execution from AWS & polls for completion instead of keeping the network connection open.  This is critical for long running operations.
* CI:  Add a couple of CI providers to enable the UI to show build information.  This is already in the codebase and [documented](https://spinnaker.io/docs/guides/developer/extending/integrate-your-ci/ ) but actually adding a few providers and possibly fixing issues around showing CI integration would be of use.
* Bring in changes from forks.  There's a few forks that have nice features we could bring in at anytime.  Azure fixes and some UI tweaks.
* Move igor to use SQL instead of redis
* Move rosco to use SQL instead of redis

### 2026.3.0

#### Primary goal is the removal and upgrade of some core libraries.  We'll be marking several things as deprecated as we plan to remove them. 
* Add API token support to the spin CLI with the new feature
* Make several older configs default to on going forward (API token, some other default settings)
* Pub/Sub ->  Introduce a "pub/sub" based cache scheduler.  The primary driver here would be to add a native spring approach for queueable operations vs custom queue or task operations.  Add libraries to support this
in kork-pub-sub.  Cleanup the various pubsub implementations (echo & kork) to be centralized via kork library handling. 
* GCP - additional support for some google features like regional external load balancers.
* Full V2 SDK for AWS API operations.  Thanks to some contributions, we should be on or nearly fully on a v2 of the AWS SDKs.
* s3/gcs storage in front50 as deprecated.  We plan to remove all storage support for front50 for anything other than SQL.  This should simplify the codebase quite a bit.
* Remove halyard.  We'd marked it deprecated in favor of a kustomize example but plan to fully remove and stop patching it going forward.
* Remove edda (part of AWS v2 migration).  This is already NOT supported on new V2 efforts but will remove it from the codebase entirely.
* Deprecate titus from the project
* Deprecate redis as a backend for orca storage (NOT scheduler, just storage of executions)
* Continue removal of Angular for React components
* Change information on observability from Armory's observability agent to using OTEL
* Upgrade the docs site to latest releases of docsy & hugo (enables a number of features)
* Remove "OnDemand" system.  There's only one scheduler that works with it and it is not a viable scheduler.  This will simplify cache operations.

#### Stretch goals
We'd like to do some additional "cleanup" tasks.  Some of these are more difficult than others but would welcome PRs to assist!
* Remove spectator in favor of native micrometer registry support.  This one has been started
* Move SAML from custom to spring.  A long standing complaint is that spinnaker replaces or overrides spring configuration.  OAuth2 was changed to be native spring based recently, though spinnaker still
wraps certain calls.  We plan to do the same for SAML to simplify AND expose more direct Spring SAML configuration.

There IS work towards one major change in the project.  There is work towards removing fiat ENTIRELY in favor of local per service permissions validation.  Fiat is known to have scale issues with LARGE numbers of accounts and projects, and it's yet another service to maintain.  Removal would drastically simplify the project while providing major performance improvements at scale.  This is currently not officially planned, but being discussed and it's unknown if it will make it into the 2026.3.x release.  That said, please plan long term on the removal of fiat from your deployments.

### 2026.4.0:  
We should see some major version upgrades with minor fixes some overall enhancements to the project.  One proposed change is to modify the GCP handling to have a V2 that allows a more kubernetes like 
operation on deploys instead of masking all the configuration.  Essentially, allow a set of "Direct" operations by API type and more granular control than the current atomic operations.  This means that the
entire available options in the SDK would in essence be open by adjusting the JSON to these new operations.  

* Java 25 
* Spring Boot 4
* Virtual thread support for better performance
* Merge deck-kayenta into deck.  A separate UI for kayenta at this point doesn't make sense, so collapse it down to simplify the builds and project
* Better pub/sub integration.  Add an off-the-shelf pub/sub solution vs. the custom task queue for operations.

Cleanup past deprecations:
* Remove s3 storage from Front50 
* Keep S3 storage for "artifact store" for orca.  Front50 is ONLY SQL
* Remove AWS SDK v1 support
