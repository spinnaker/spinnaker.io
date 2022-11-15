---
title: "Secrets in Google Secret Manager"
description: This document describes how to set up Spinnaker secrets in a Google Secret Manager.
---

This example uses secrets - `mysecret1`, `mysecret2` - to store GitHub credentials and secret - `mykubeconfig` - to store kubeconfig file.


## Authorization
Since you're storing sensitive information you protect the secret by restricting access to it through [IAM roles](https://cloud.google.com/secret-manager/docs/access-control). Encryption at rest is [already provided](https://cloud.google.com/secret-manager/docs/encryption) by default.

Remember to run Halyard's daemon and Spinnaker services with a service account that allows them to read that content.


## Storing secrets

### Storing credentials
Store your GitHub token in a secret named `mysecret` either as a complete secret or as a value of one of the json keys:

- secret `mysecret1`:
``` 
    <TOKEN>
```
- secret `mysecret2`:
```json
    {
      "github-token": "<TOKEN>",
      "some-other-key": "<some-other-secret>"
    }
```

Note: You could choose to store the token under different key than `github-token`. You'd just need to [change how to reference the secret](#referencing-secrets).

### Storing sensitive files
Some Spinnaker configuration uses information stored as files. For example, upload the `kubeconfig` file of your Kubernetes account directly to `mykubeconfig` secret:

```
gcloud secrets versions add mykubeconfig --data-file="/path/to/kubeconfig"
```


## Referencing secrets

Now that secrets are safely stored in the Secret Manager, you reference them from your config files using the format below. The Secret Manager specific parameters (`p:<project number>`, `s:<secret id>`, `k:<optional json key>`, `v:<optional secret version>`) can be in any order.
To reference secret literal values:

```
encrypted:google-secrets-manager!p:<project number>!s:<secret id>!k:<optional json key>!v:<optional secret version>
```
To reference secret files:

```
encryptedFile:google-secrets-manager!p:<project number>!s:<secret id>!v:<optional secret version>
```

To reference the latest version of secret from `mysecret1`, use:

```
encrypted:google-secrets-manager!p:123456789012!s:mysecret1
```

The `k:<key>` parameter is only necessary when storing secret values in a json file. Also, the `v:<secret version>` parameter is required only when the secret is not from the latest version. To reference `github-token` from the secret above having version `2`, use:

```
encrypted:google-secrets-manager!p:123456789012!s:mysecret2!k:github-token!v:2
```

But to reference your kubeconfig file, you must leave off the `k` parameter and use `encryptedFile` prefix:

```
encryptedFile:google-secrets-manager!p:123456789012!s:mykubeconfig
```