---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.38

### retrofit2 upgrade

All retrofit clients are upgraded to retrofit2 and any references to retrofit1 dependencies are removed in the following services.
- Igor - https://github.com/spinnaker/igor/pull/1313

### spring security 5 oauth2 migration in gate
Remove deprecated OAuth2 annotation. Instead Use Java DSL way of OAuth2
- gate - https://github.com/spinnaker/gate/pull/1887
Migrated OAuth2 configuration to align with Spring Security 5 Java DSL standards
- halyard - https://github.com/spinnaker/halyard/pull/2216
Update Spinnaker documentation for OAuth2 property changes in Spring Security 5
- spinnaker.io - https://github.com/spinnaker/spinnaker.io/pull/503
