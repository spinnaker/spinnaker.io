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

