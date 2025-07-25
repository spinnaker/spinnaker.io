---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2025.1.0

### Helm OCI Registry Chart Support
Docker registry provider now supports adding OCI-based registries hosting Helm repositories. This feature allows
users to download and bake Helm charts hosted in OCI-compliant registries (such as Docker Hub).

Related PRs:
- https://github.com/spinnaker/spinnaker/pull/7069
- https://github.com/spinnaker/spinnaker/pull/7089
- https://github.com/spinnaker/spinnaker/pull/7113

To enable the Helm OCI support in a Docker Registry account set a list of OCI repositories in the `helmOciRepositories`
of the Docker Registry account configuration. The `helmOciRepositories` is a list of repository names in the format `<registry>/<repository>`. For example:
```yaml
dockerRegistry:
  enabled: true
  primaryAccount: dockerhub   # Must be one of the configured docker accounts
  accounts:
    - name: dockerhub
      requiredGroupMembership: []
      providerVersion: V1
      permissions: {}
      address: https://index.docker.io  # (Required). The registry address you want to pull and deploy images from; e.g. https://index.docker.io
      username: <username>   # Your docker registry email (often this only needs to be well-formed, rather than be a real address)
      password: <password>
      cacheIntervalSeconds: 30          # (Default: 30). How many seconds elapse between polling your docker registry.
      clientTimeoutMillis: 60000        # (Default: 60000). Timeout time in milliseconds for this repository.
      cacheThreads: 1                   # (Default: 1). How many threads to cache all provided repos on. Really only useful if you have a ton of repos.
      paginateSize: 100                 # (Default: 100). Paginate size for the docker repository _catalog endpoint.
      sortTagsByDate: false             # (Default: false). Sort tags by creation date.
      trackDigests: false               # (Default: false). Track digest changes. This is not recommended as it consumes a high QPM, and most registries are flaky.
      insecureRegistry: false           # (Default: false). Treat the docker registry as insecure (don’t validate the ssl cert).
      repositories:
        - "registry/repository"         # (Default: []). An optional list of repositories to cache Docker images from. If not provided, Spinnaker will attempt to read accessible repositories from the registries _catalog endpoint
      helmOciRepositories:
        - "registry/HelmOciRepository" # (Default: []). An optional list of Helm OCI-Based repositories to cache helm charts from.
```

For every account with non-empty `helmOciRepositories` list, Clouddriver will cache the Helm charts from the specified OCI repositories.

The cached Helm OCI charts are defined as a new Artifact type named `helm/image` and can be used to bake Helm OCI-based charts in Spinnaker pipelines.

#### Defining retention policy for downloaded helm/image charts in Clouddriver
Optionally, users can define a retention policy for Helm OCI charts downloaded in a Clouddriver instance. This functionality
is disabled by default and it is useful for users that want to keep a local copy of a Helm OCI based chart without the need
to download it every time it is used in a pipeline. The retention policy is defined in the `clouddriver-local.yml` configuration file:
```
artifacts:
   helm-oci:
    clone-retention-minutes: 60
    clone-retention-max-bytes: 104857600 # 100MB
```

* `clone-retention-minutes:` Default: 0. How much time to keep the downloaded helm/image chart. Values are:
    * 0: no retention.
    * -1: retain forever.
    * any whole number of minutes, such as `60`.
* `clone-retention-max-bytes:` Default: 104857600 (100 MB). Maximum amount of disk space to use for downloaded helm/image charts. When the
maximum amount of space is reached, Clouddriver deletes the clones after returning the artifact to the pipeline, just as if retention were disabled.

#### Defining Triggers for helm/image artifacts in Spinnaker pipelines
To trigger a Spinnaker pipeline on a new version of a Helm OCI-based chart, users will need to enable the Igor poller for the `helm/image` artifact type.
This can be done by adding the following configuration to the `igor-local.yml` file:
```
helm-oci-docker-registry:
  enabled: true
```

Additionally, a new trigger type (named `helm/oci`) has been implemented to allow pipelines to be triggered by new versions of `helm/image` artifacts.
```json
  "triggers": [
    {
      "account": "<accountName>",
      "enabled": true,
      "organization": "<org>",
      "registry": "index.docker.io",
      "repository": "org/repositoryName",
      "type": "helm/oci"
    }
  ],
```

### Header Authentication in Gate

https://github.com/spinnaker/spinnaker/pull/7109 added a gate-header module to gate that provides what's known as header authentication.  It's meant for scenarios where something external to gate it providing "real" authentication via mTLS or similar, as it's very permissive.  When `header.enabled` is true (false by default), gate requires an X-SPINNAKER-USER header on incoming http requests, and uses the value of that header as the username/email.  Gate logs in to fiat and queries fiat for allowed accounts.  Again, any incoming request can specify an arbitrary value for X-SPINNAKER-USER and gate-header uses it.

#### Retrofit2 Upgrade

Retrofit1 clients from the following spinnaker services have been upgraded to retrofit2. With this release, retrofit2 upgrade of all spinnaker services is completed.
- Orca: https://github.com/spinnaker/spinnaker/pull/7085
- Kayenta: https://github.com/spinnaker/spinnaker/pull/7093
- Halyard: https://github.com/spinnaker/spinnaker/pull/7098

A new CallAdapter named LegacySignatureCallAdapter has been introduced in Kork to provide support for legacy Retrofit method signatures. This adapter enables the use of Retrofit interfaces that do not return Call<..>, similar to how Retrofit 1 worked. Both Kayenta and Halyard leveraged this feature during their Retrofit 2 upgrades, allowing them to maintain their existing method signatures without wrapping them in Call<..> or using Retrofit2SyncCall.execute()
- https://github.com/spinnaker/spinnaker/pull/7088

### Orca

https://github.com/spinnaker/spinnaker/pull/7164 adds root id to the pipeline execution context.  Code outside of Spinnaker that processes executions may need adjusting to handle the additional field.
