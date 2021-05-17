---

title:  "Configure a GitLab artifact account"
description: Configure a GitLab artifact account so that Spinnaker can download files from GitLab.
---

## Prerequisites

* You need a [GitLab](https://gitlab.com) account.

### Downloading credentials

Start by generating an [access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
for GitLab.

Place the token in a file (`$TOKEN_FILE`) readable by Halyard:

```bash
echo $TOKEN > $TOKEN_FILE
```

## Editing your artifact settings

All that's required are the following values:

```bash
# See the prerequisites section above
TOKEN_FILE=

ARTIFACT_ACCOUNT_NAME=my-gitlab-artifact-account
```

First, enable [artifact support](/docs/reference/artifacts/#enabling-artifact-support).

Next, enable the GitLab artifact provider:

```bash
hal config artifact gitlab enable
```

Next, add an artifact account:

```bash
hal config artifact gitlab account add $ARTIFACT_ACCOUNT_NAME \
    --token-file $TOKEN_FILE
```

There are more options described
[here](/docs/reference/halyard/commands#hal-config-artifact-gitlab-account-edit)
if you need more control over your configuration.
