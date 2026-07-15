---
title:  "Configure Helm Artifact account"
description: >
  Spinnaker stages that consume artifacts can read from a Helm provider directly.
---

The provider can be an Artifactory like [Nexus](https://help.sonatype.com/repomanager3/formats/helm-repositories), [JFrog](https://jfrog.com/integration/helm-repository/), or [Chartmuseum](https://chartmuseum.com/).

If the files are hidden behind basic auth, you can configure an artifact account with the needed credentials to read
your artifacts. Basic auth is the only authentication mechanism supported for accessing a Helm artifact account.

## Setup usage in pipeline executions
### Download credentials

1. Collect your basic auth `$USERNAME` and `$PASSWORD`
2. Pick a `$USERNAME_PASSWORD_FILE` location on your disk
3. Run:

   ```bash
   echo ${USERNAME}:${PASSWORD} > $USERNAME_PASSWORD_FILE
   ```
Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.


### Add the account and enable it
Add this to `clouddriver-local.yml`

```yaml
artifacts:
  enabled: true
  helm:
    enabled: true
    accounts:
    - name: my-helm-account
      username-password-file: <secret-manager|/mnt/secret/filename>
```

## Trigging from helm changes
To enable helm changes to TRIGGER a pipeline, you need to add some configuration to
igor which then polls clouddriver for accounts and changes and tracks updates.

Add this to `igor-local.yml`
```yaml
helm:
  enabled: true
```
Igor will then poll clouddriver for helm artifact accounts and look for new helm resources for that account.  When
it finds new helm resources, it will trigger any pipeline with a helm trigger configured, and then track completion
of triggering on the new helm so it does not refire new executions.  See [the common polling](https://github.com/spinnaker/spinnaker/tree/main/igor#common-polling-architecture) in igors README for more information.

There are more options [in the code base ](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-helm/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/helm/HelmArtifactAccount.java) if you need more control over your configuration.