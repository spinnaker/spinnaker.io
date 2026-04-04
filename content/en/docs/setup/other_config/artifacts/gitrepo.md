---
title:  "Configure a Git Repo Artifact Account"
description: "This shows how to configure a Git repo artifact account so that Spinnaker can use an entire repo as a single artifact." 
---

## Overview

Each time a pipeline needs a Git repo artifact during execution, Clouddriver clones the entire repo, sends the repo
artifact to the pipeline, and then deletes the cloned repo immediately.

Spinnaker includes a feature for caching a Git repo artifact. Clouddriver clones the Git repo the first time a
pipeline needs it and then caches the repo for a configured retention time. Each subsequent time the pipeline needs to
use that Git repo artifact, Clouddriver does a `git pull` to fetch updates rather than cloning the entire repo again.
This behavior is especially useful if you have large repositories. Clouddriver deletes the cloned Git repo when the configured
retention time expires.  
**This is an opt-in feature that is disabled by default.** See the [Enable
`git pull` support](#enable-git-pull-support) section for details.

## Prerequisites

* You need a Git account.


### Download credentials

#### Token auth
Generate an access token for your Git provider (eg, [GitHub](https://github.com/settings/tokens) or [GitLab](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)). The token requires the __repo__ scope.

### User-Password auth

1. Create a username-password file, with contents in the following format:
   ```
   <username>:<password>
   ```

### SSH key auth
Create an SSH key for your user or add to the ssh allowed keys configuration.

## Store the credentials for user
Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.

## Add the account and enable it with one of the auth options

```yaml
artifacts:
  enabled: true
  gitrepo:
    enabled: true
    accounts:
    - name: my-git-account
      username: git
      password: password
      tokenFile: /mnt/someplace/tokenFile
      sshPrivateKeyFilePath: SSH_KEY_FILE
      sshPrivateKeyPassphrase: somePassPhrase
      sshPrivateKeyPassphraseCmd: <some command>
      sshKnownHostsFilePath: KNOWN_HOSTS_FILE
      sshTrustUnknownHosts: false
```

## Enable `git pull` caching support

This feature is disabled by default. To enable `git pull` support, add the following section to your `clouddriver-local.yml` file:

```yaml
artifacts:
  enabled: true
  gitrepo:
    enabled: true
    clone-retention-minutes: 60
    clone-retention-max-bytes: 104857600
```

* `clone-retention-minutes:` Default: 0. How much time to keep clones. Values are:
  * 0: no retention.
  * -1: retain forever.
  * any whole number of minutes, such as `60`.
* `clone-retention-max-bytes:` Default: 104857600 (100 MB). Maximum amount of disk space to use for clones. When the maximum amount of space is reached, Clouddriver deletes the clones after returning the artifact to the pipeline, just as if retention were disabled.

### Other options
See the [GitRepo Artifact Account code](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-artifacts/clouddriver-artifacts-gitrepo/src/main/java/com/netflix/spinnaker/clouddriver/artifacts/gitRepo/GitRepoArtifactAccount.java) for additional options.
