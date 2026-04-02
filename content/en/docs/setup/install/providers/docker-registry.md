---

title:  "Docker Registry"
description: Configure Spinnaker to use Docker as a source for images.
aliases: 
   - /setup/providers/docker-registry/
---


> :warning: This only acts as a source of images, and does not include support
> for deploying Docker images.

When configuring Docker Registries, an
[Account](/docs/concepts/providers/#accounts) maps to a credential able to
authenticate against a certain set of [Docker
repositories](https://docs.docker.com/glossary/?term=repository).

## Prerequisites

* The Docker Registry you are configuring must already exist.
* That Registry must support the
  [v2 registry API](https://docs.docker.com/registry/spec/api/). OCI registries are ALSO supported at this time.


## Registry providers

You can set up a Docker Registry provider for Spinnaker using any of the
repositories listed here. Each one supports the same API, but there
are subtle differences in how to get them to work with Spinnaker.

- [Prerequisites](#prerequisites)
- [Registry providers](#registry-providers)
    - [DockerHub](#dockerhub)
    - [GitHub Container Registry](#github-container-registry)
    - [Google Artifact Registry](#google-artifact-registry)
    - [Amazon Elastic Container Registry (ECR)](#amazon-elastic-container-registry-ecr)
    - [Other registries](#other-registries)
- [Add the account](#add-the-account)
- [Advanced Account Settings](#advanced-account-settings)
- [Next Steps](#next-steps)

### DockerHub

The DockerHub registry address is `index.docker.io`, keep track of this for
later:

```bash
ADDRESS=index.docker.io
```

Dockerhub hosts a mix of public and private repositories, but does not expose a
[catalog](https://docs.docker.com/registry/spec/api/#listing-repositories)
endpoint to programmatically list them. Therefore you need to explicitly list
which Docker repositories you want to index and deploy. For example, if you
wanted to deploy the public NGINX image, alongside your private `app` image,
your list of repositories would look like:

```bash
REPOSITORIES=library/nginx yourusername/app
```

> __NOTE__: Keep in mind that the repository name is typically either prefixed
> with `library/` for most public images, or `<username>/` for images belonging
> to user `<username>/`.

If any of your images aren't publicly available, make sure you know your
DockerHub username & password to supply to `hal` later:

```bash
USERNAME=yourusername
PASSWORD=hunter2
```

### GitHub Container Registry
To note since GitHub does NOT expose a catalog endpoint you MUST explicitly
define which repositories you want to be cached here.  You can deploy other
images, just be aware that spinnaker won't cache, trigger or show those
in the dropdowns UNLESS you've added them below.

```yaml
docker-registry:
  enabled: true
  accounts:
  - name: docker-ghcr-jasonmcintosh
    address: https://ghcr.io/
    username: jasonmcintosh
    password: encrypted:s3!n:artifact-creds!k:githubPatToken
    repositories:
    - jasonmcintosh/spinnaker-work/demo-web-app
```

### Google Artifact Registry

1. Set the registry address.

   The GAR typical address for an image is `[LOCATION]-docker.pkg.dev/[PROJECT-ID]/[REPOSITORY]`, but
   see google docs for more information on the appropriate URLs. You'll typically use the location-docker.pkg.dev for
   API calls
   due to how the docker APIs are setup.

1. Enable [access to the catalog endpoint](https://stackoverflow.com/questions/79055597/what-iam-role-is-required-for-using-the-docker-registry-catalog-v2-api-with-gcp#:~:text=1%20Answer,1263)

Make sure you have setup auth with these permissions if you want to use the
[catalog](https://docs.docker.com/registry/spec/api/#listing-repositories)
endpoint to programmatically list all images available to your credentials,
so you don't have supply repositories manually for cache purposes.

1. Setting up a [service account](https://cloud.google.com/compute/docs/access/service-accounts)
   is the preferred way to authenticate to GAR. Please read the google docs for the appropriate commands

   > NOTE That GAR uses OCI compliant APIs and as such, operates a bit differently than standard docker registries.

2. Enable the provider and add the account by adding to `clouddriver-local.yml` the following

```yaml
artifacts:
  helm-oci:
    clone-retention-minutes: 60
dockerRegistry:
  enabled: true
  primaryAccount: gar-registry   # Must be one of the configured docker accounts
  accounts:
    - name: gar-registry
      requiredGroupMembership: [ ]
      providerVersion: V1
      permissions: { }
      address: https://us-docker.pkg.dev
      username: example
      passwordFile: /mnt/secrets/secret-entry.json
      #passwordCommand: 
      cacheIntervalSeconds: 30
      clientTimeoutMillis: 60000
      cacheThreads: 1
      paginateSize: 100
      sortTagsByDate: false
      trackDigests: false
      insecureRegistry: false
      helmOciRepositories:
        - "spinnaker-community/docker/clouddriver"

```

### Amazon Elastic Container Registry (ECR)

1. Get the registry address.

   ECR registry addresses are specific to an AWS account and region. You can retrieve the address from the ECR console,
   or with `aws ecr describe-repositories`. An example:

   ```bash
   ADDRESS=012345678910.dkr.ecr.us-east-1.amazonaws.com
   REGION=us-east-1
   ```

1. Set up authentication.

   The Spinnaker instance running the Clouddriver service will be doing the queries to these accounts.  As such you'll need to grant the role that spinnaker runs
   as permissions to interact with the ECR repository. Attach the `AmazonEC2ContainerRegistryReadOnly` managed policy to the IAM role/user for your Spinnaker
   installation. For example,

   ```bash
   aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --role-name SpinnakerRole
   ```

   or:

   ```bash
   aws iam attach-user-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --user-name spinnaker
   ```

1. Enable the provider and add the account

```yaml
dockerRegistry:
  enabled: true
  primaryAccount: ecr-registry   # Must be one of the configured docker accounts
  accounts:
    - name: ecr-registry
      requiredGroupMembership:
      providerVersion: V1
      address: 012345678910.dkr.ecr.us-east-1.amazonaws.com
      username: AWS
      passwordCommand: "aws --region us-east-2 ecr get-authorization-token --output text --query 'authorizationData[].authorizationToken' | base64 -d | sed 's/^AWS://'"
```

### Other registries

Most registries fit either the Dockerhub or GCR pattern described above,
or some mix of the two. In all cases you need to know the FQDN of the
registry, and your username/password pair if you are accessing private images.
If your registry supports the [`/_catalog`
endpoint](https://docs.docker.com/registry/spec/api/#listing-repositories)
you do not have to list your repositories. If it does not, keep in mind that the
repository names are generally of the form `<username>/<image name>`. 

| Registry          | FQDN                                         | Catalog |
|-------------------|----------------------------------------------|:-------:|
| GAR               | `location`-docker.pkg.dev                    |   Yes   |
| DockerHub         | index.docker.io                              |   No    |
| Quay              | quay.io                                      |   Yes   |
| ECR               | `account-id`.dkr.ecr.`region`.amazon.aws.com |   Yes   |
| JFrog Artifactory | `server`-`repo`.jfrog.io                     |    ?    |
| ghcr              | ghcr.io                                      |   no    |

### Add the account
You can add any other compliant OCI or Docker registry by adding entries similar to the above examples by changing the username, password/passwordCommand, URLs and repositories as needed.

## Advanced Account Settings

If you are looking for more configurability, please see the other options
listed in
the [Docker account properties](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-docker/src/main/groovy/com/netflix/spinnaker/clouddriver/docker/registry/config/DockerRegistryConfigurationProperties.groovy#L31).

## Next Steps
Optionally, you can [set up another cloud provider](/docs/setup/install/providers/) or
continue the [installation instructions](/docs/setup/install/)
