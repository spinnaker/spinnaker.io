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
