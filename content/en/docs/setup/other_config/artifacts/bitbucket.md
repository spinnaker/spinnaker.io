---

title:  "Configure Bitbucket Artifact Credentials"
description: Spinnaker supports reading data from Bitbucket artifacts directly.
---

If the files are hidden behind basic auth, you can configure an artifact
account with the needed credentials to read your artifact.

## Prerequisites

1. Collect your basic auth `$USERNAME` and `$PASSWORD`
2. Pick a `$USERNAME_PASSWORD_FILE` location on your disk
3. Run:

   ```bash
   echo ${USERNAME}:${PASSWORD} > $USERNAME_PASSWORD_FILE
   ```

## Edit your artifact settings

1. Collect the `$USERNAME_PASSWORD_FILE` value returned from the
   [prerequisites](#prerequisites) section above.
   
2. Enable [artifact support](/docs/reference/artifacts/#enabling-artifact-support).


3. Enable the Bitbucket artifact provider:

   ```bash
   hal config artifact bitbucket enable
   ```

4. Add an artifact account:

   ```bash
   hal config artifact bitbucket account add my-bitbucket-account \
       --username-password-file $USERNAME_PASSWORD_FILE
   ```

There are more options described
[here](/docs/reference/halyard/commands#hal-config-artifact-bitbucket-account-edit)
if you need more control over your configuration.
