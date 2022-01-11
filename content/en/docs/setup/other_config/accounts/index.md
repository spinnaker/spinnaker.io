---
title: "Clouddriver Account Management"
weight: 45
description: Clouddriver can load and store accounts in a database for dynamic account management.
---

Spinnaker 1.28 introduced an alpha API for loading, storing, updating, and otherwise managing Clouddriver account configurations from a database.
Combined with a supported [external secrets manager](/docs/reference/halyard/secrets/), account credentials can be provided by end users when setting up an account configuration.

The following table lists the Clouddriver account types that currently support the account management API.
Note that the type discriminator is used as the value for the key `@type` in the JSON representation of an account definition.

| Cloud Provider | Type Discriminator | Account Definition Class                                                                              |
|----------------|--------------------|-------------------------------------------------------------------------------------------------------|
| Kubernetes     | `kubernetes`       | `com.netflix.spinnaker.clouddriver.kubernetes.config.KubernetesAccountProperties.ManagedAccount`      |


## Enabling account management

As an alpha API and feature, this must be explicitly enabled in your `clouddriver-local.yml` configuration by adding `account.storage.enabled: true`.
Note that credentials polling must be enabled for each cloud provider type being managed by this API.
For example, to enable credentials polling for Kubernetes with a polling period of one minute, add the following configuration to your `clouddriver-local.yml` configuration.

```yml
credentials:
  poller:
    enabled: true
    types:
      kubernetes:
        reloadFrequencyMs: 60000
```

The default implementation of account storage is through SQL.
This can be configured in your `clouddriver-local.yml` file as well.

```yml
sql:
  enabled: true
  connectionPools:
    accounts:
      dialect: Postgres
      jdbcUrl: jdbc:postgresql:clouddriver
```

Use of the `default` connection pool is also allowed when all Clouddriver SQL data is stored in the same database.

## Account management API

Accounts can be created, updated, and deleted through the `/credentials` Gate endpoints.
Any authenticated user may create an account, and write permissions are required to update, delete, or otherwise use that account.
Secrets should be specified using either an `encrypted:...` URI for strings or an `encryptedFile:...` URI for files.
For example, to create a new Kubernetes account, suppose we have a `kubeconfig` file for a Kubernetes service account stored in AWS Secrets Manager in the `us-west-2` region named `my-kubernetes-credentials`.
Then the following REST API call may be used for configuring an account by sending a `POST` request to `GATE_URL/credentials`.

```json
{
    "@type": "kubernetes",
    "name": "my-kubernetes-account",
    "permissions": {"READ":["my-group"],"WRITE":["my-group"]},
    "context": "eks",
    "namespaces": [
        "default"
    ],
    "kubeconfigContents": "encrypted:secrets-manager!r:us-west-2!s:my-kubernetes-credentials"
}
```

Sending the same request body as a `PUT` request to `GATE_URL/credentials` will update the existing account definition.
Finally, sending a `DELETE` request to `GATE_URL/credentials/my-kubernetes-account` will delete the `my-kubernetes-account` account definition.
Both of these endpoints require write permission on the affected account.
