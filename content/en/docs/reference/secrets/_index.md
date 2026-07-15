---
title: "Secrets"
description: Storing Spinnaker configs in a Git repository is a great solution for maintaining versions of your configurations, but storing secrets in plain text is a bad security practice.
---

Spinnaker supports separating your secrets from your configs through end-to-end secrets management. Simply replace
secrets in your config files with the syntax described here, and Spinnaker decrypts them as needed at start time.

## Secret Format
To reference secrets in configs, use the following general format for secret literal values, like passwords and tokens:

```
encrypted:<secret engine>!<key1>:<value1>!<key2>:<value2>!...
```
To reference secret files like kubeconfig files the syntax is:

```
encryptedFile:<secret engine>!<key1>:<value1>!<key2>:<value2>!...
```

The key-value parameters making up the string vary with each secret engine. Refer to the specific documentation for each engine for more information.

For instance, if you replace the GitHub token in your config with an encrypted syntax:
```yaml
...
  github:
    enabled: true
    accounts:
    - name: github
      token: encrypted:<secret engine>!<key1>:<value1>!<key2>:<value2>!...
...
```
Spinnaker will read these secrets at start time.

## Supported Secret Engines
The secrets framework is extensible and support for new engines can easily be added. Currently the following is supported:

* [S3](/docs/reference/secrets/s3-secrets/)
* [GCS](/docs/reference/secrets/gcs-secrets/)
* [AWS Secrets Manager](/docs/reference/secrets/secret-manager-secrets/)

Google Secrets manager is also supported though not at this time documented.  You can see
[the code and translate it](https://github.com/spinnaker/spinnaker/blob/main/kork/kork-secrets-gcp/src/main/java/com/netflix/spinnaker/kork/secrets/engines/GoogleSecretsManagerSecretEngine.java) to a supported format.