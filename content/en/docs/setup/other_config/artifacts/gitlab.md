---

title:  "Configure a GitLab artifact account"
description: Configure a GitLab artifact account so that Spinnaker can download files from GitLab.
---

## Prerequisites

* You need a [GitLab](https://gitlab.com) account.

### Download credentials

Start by generating an [access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
for GitLab.

Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.



## Add the account and enable it

All that's required are the following configuration:

```yaml
artifacts:
  enabled: true
  gitlab:
    enabled: true
    accounts:
    - name: my-gitlab-account
      token: patToken
      tokenFile: /mnt/someplace/tokenFile
  
```

There are more options including URL restrictions that can be set to allow only internal gitlab hosts.
[See the gitlab account definition ](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-gitlab/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/gitlab/GitlabArtifactAccount.java)
for information.
