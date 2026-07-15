---

title:  "Configure Bitbucket Artifact Credentials"
description: Spinnaker supports reading data from Bitbucket artifacts directly.
---

If the files are hidden behind basic auth, you can configure an artifact
account with the needed credentials to read your artifact.

### Download credentials

1. Collect your basic auth `$USERNAME` and `$PASSWORD`
2. Pick a `$USERNAME_PASSWORD_FILE` location on your disk
3. Run:

   ```bash
   echo ${USERNAME}:${PASSWORD} > $USERNAME_PASSWORD_FILE
   ```
Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.


## Add the account and enable it
Enable the Bitbucket artifact provider in `clouddriver-local.yml` and add an artifact account:
```yaml
artifacts:
  enabled: true
  bitbucket: 
    enabled: true
    accounts:
    - name: my-bitbucket-account
      username-password-file: /mnt/password/file
```
Add the password file either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/) or
to a volume mounted into the clouddriver pod by modifying the deployment.yaml for clouddriver.

[more configuration for an account](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-bitbucket/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/bitbucket/BitbucketArtifactAccount.java)
is available looking at the account code.
