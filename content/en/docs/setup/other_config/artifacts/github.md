---

title:  "Configure a GitHub artifact account"
description: Configure a GitHub artifact account so that Spinnaker can download files from GitHub.
---

## Prerequisites

* You need a [GitHub](https://github.com) account.

### Download credentials

Start by generating an [access token](https://github.com/settings/tokens)
for GitHub. The token requires the __repo__ scope.

Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.

## Add the account and enable it
Add the below to `clouddriver-local.yml` to enable artifacts and add a github account

```yaml
artifacts:
  enabled: true
  github:
    enabled: true
    accounts:
    - name: my-github-account
      tokenFile: /mnt/some/file|secretReference
```

There are more options available if you look at the [github account definition code](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-github/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/github/GitHubArtifactAccount.java)
