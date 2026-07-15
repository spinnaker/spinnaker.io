---

title:  "Configure HTTP Artifact Credentials"
description: Spinnaker supports reading HTTP files directly for artifacts.
---

If the files are hidden behind basic auth, you can configure an artifact
account with the needed credentials to read your artifact. _If not_, no further
configuration is needed, Spinnaker can automatically add a
`no-auth-http-account` for this purpose.

You can configure more than one artifact account, each with separate
credentials. Specify which account to use in the configuration for the stage
that reads the data. If you have only one such account configured, the stage
config for this is hidden, and the single account is automatically used.

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

Add the following to `clouddriver-local.yml`
```yaml
artifacts:
  enabled: true
  http:
    enabled: true
    accounts:
    - name: some-account
      username-password-file: </mnt/file|secretReference>
```

There are more options [in the code](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-http/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/http/HttpArtifactAccount.java) 
including the ability to set restrictions on endpoints receiving these requests.
<strong>IT IS HIGHLY </strong> recommended that you limit these requests to
specific trusted URLs since it will send credentials to these URLs.
