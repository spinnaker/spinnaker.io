---

title:  "Configure Maven Artifact Credentials"
description: Spinnaker supports artifacts stored in a Maven repository.
---

Spinnaker can be configured to deploy artifacts stored in a Maven repository.

You can configure more than one artifact account, each with separate
credentials. Specify which account to use in the configuration for the stage
that reads the data.

### Download credentials
Maven accounts at this time do not support credential authorization.  We'd welcome
PRs to enable this and get maven closer to full artifact support.

### Add the account and enable it
```yaml
artifacts:
  enabled: true
  maven:
    enabled: true
    accounts:
    - name:  nexus-internal
      repositoryUrl: https://my.repo.example.com
```
