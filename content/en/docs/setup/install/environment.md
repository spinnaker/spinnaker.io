---

title:  "Choose your Environment"
description: Based on your use case, choose how you want to install Spinnaker.
weight: 30
---

In this step, you choose where to install Spinnaker. The recommended path is an installation into a
Kubernetes cluster

* [Kubernetes installation](#Kubernetes-installation)

  Each of Spinnaker's [microservices](/docs/reference/architecture) services
  are deployed separately. __This is highly recommended for use in production.__

* [Local installations](#local-debian) of Debian packages

  Spinnaker is deployed on a single machine. This is ok for smaller
  Spinnaker deployments, but Spinnaker will be unavailable when it's being
  updated. Note it's often better to use a microk8s/k3s installation to deploy
  rather than try to deploy a local debian.

* Please see [Local git installations](/docs/community/contributing/code/developer-guides/getting-set-up/) from GitHub

  This is for developers contributing to the Spinnaker project.

## Kubernetes installation

Kubernetes installations are recommended for most organizations and even
for test purposes. Spinnaker is deployed to a namespace in a kubernetes cluster
[microservice](/docs/reference/architecture/) deployed independently.

The base example is available in the monorepo here:
https://github.com/spinnaker/spinnaker/tree/main/spinnaker-kustomize
with more information and options. To install spinnaker:

1. Make sure [kubectl is installed](https://kubernetes.io/docs/tasks/tools/)
2. Optionally,
   configure [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)
   for your Spinnaker services in their deployment manifests (in the `~/spinnaker-kustomize/base/*/deployment.yaml`
   files.
3. Adjust the domains. Look for any example.com reference and replace with your DNS domain.
4. Create a file with the spinnaker kubernetes resources and apply it
    1. `kubectl kustomize -o spinnaker.yaml`
    2. `kubectl apply -f spinnaker.yaml`
5. Get the ingress IP address and create DNS entries for your new spinnaker domain to this new entry

REMINDER:  This basic setup defaults with a SIMPLE username/password auth.  It's recommended to change
this from the default or better yet, use an identity provider (saml/oidc/ldap) solution.  The spinnaker
project does integration tests today with Keycloak as a known out of the box solution.

## Local Debian

### Prerequisites

We recommend at least 4 cores and 16GB of RAM.

### Overview

The __Local Debian__ installation means Spinnaker will be installed and run on a
single machine. We recommend at least 4 cores and 16GB of RAM.
Note this is a non-recommended installation but is simple to install. Spinnaker configuration files default to
/opt/spinnaker/config. You can copy the files from the `spinnaker-kustomize` example repo for each service. Services
load properties from in the following priority order

* `spinnaker.yml`
* `spinnaker-local.yml`
* `<service>.yml`
* `<service>-local.yml`

It's recommended NOT to change the spinnaker.yml or service.yml and instead override their settings in the service
local yml files. These base files often are "defaults" or core settings. Base settings can be found in the
source code for each service similar
to https://github.com/spinnaker/spinnaker/blob/main/front50/front50-web/config/front50.yml
path where each service has a `<service>/<service>-web/config/<service>.yml` file defining defaults.

> **Note**: Local Debian installation requires a recent ubuntu/debian and installation of components like kubectl
> or the aws cli depending upon deployment targets. They also need a Java 17 JRE installed.

### Intended use case

The __Local Debian__ installation is intended for smaller deployments of Spinnaker,
however, since all services are on a single machine, there is potential downtime.

#### Install local dependencies

Ensure that the following are installed on your system:

* git: `sudo apt-get install git`
* curl: `sudo apt-get install curl`
* redis-server: `sudo apt-get install redis-server`
* JDK 17 - JDK (we're building from source, so a JRE is not sufficient)
* npm/node (version >=16)
* yarn: `npm install -g yarn` or [guide](https://yarnpkg.com/lang/en/docs/install/)

## Further reading

* [Spinnaker Architecture](/docs/reference/architecture/) for a better understanding
  of the Distributed installation.

## Next steps

Now that your deployment environment is set up, you need to provide Spinnaker
with a [Persistent Storage](/docs/setup/install/storage/) source.
