---

title:  "Choose your Environment"
description: Based on your use case, choose how you want to install Spinnaker.
weight: 10
---

In this step, you choose where to install Spinnaker. The recommended path is an installation into a
Kubernetes cluster

* [Kubernetes installation](#kubernetes-installation)

  Each of Spinnaker's [microservices](/docs/reference/architecture) services
  are deployed separately. __This is highly recommended for use in production.__

* [Local installations](#local-debian) of Debian packages

  You can also install on a single local machine, or for Spinnaker development, making sure you have the 4 cores and 16GB in each case.

  Spinnaker is deployed on a single machine. This is ok for smaller
  Spinnaker deployments, but Spinnaker will be unavailable when it's being
  updated. Note it's often better to use a microk8s/k3s installation to deploy
  rather than try to deploy a local debian.

* Please see [Local git installations](/docs/community/contributing/code/developer-guides/getting-set-up/) from GitHub

  This is for developers contributing to the Spinnaker project.

## Kubernetes installation

Spinnaker runs in a dedicated Kubernetes namespace as a set of independently deployed microservices.

See the [microservice reference architecture](/docs/reference/architecture/).

The base example is available in the monorepo here:
<https://github.com/spinnaker/spinnaker/tree/main/spinnaker-kustomize>
with more information and options.

To install spinnaker:

1. Make sure [kubectl is installed](https://kubernetes.io/docs/tasks/tools/)

    ```bash
    kubectl version --client
    ```

2. set a working directory `WORKING_DIR="$HOME/workspace-install-spinnaker/"`

    ```bash
    mkdir -pv "$HOME/workspace-spinnaker-install/"
    ```

3. clone the base example github repo

    ```bash
    git clone https://github.com/spinnaker/spinnaker.git $HOME/workspace-spinnaker-install/spinnaker
    ```

4. Optional: configure [Kubernetes probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)
      for your Spinnaker services in their deployment manifests files. located inside `base/*/deployment.yaml`/

    ```bash
    ls -lha $HOME/workspace-spinnaker-install/spinnaker/spinnaker-kustomize/base/*/
    ```

5. switch to the `kustomize` directory in the `spinnaker` base repo

   ```bash
    pushd $WORKING_DIR/spinnaker/spinnaker-kustomize
    ```

6. Adjust the DNS domains. Look for any `example.com` reference and replace with your DNS domain.

7. Create a file with the spinnaker kubernetes resources and apply it

    ```bash
    kubectl kustomize --output="spinnaker.yaml"
    ```

8. Apply the YAML file

    ```bash
    kubectl apply --filename="spinnaker.yaml"
    ```

9. Get the ingress IP address and create DNS entries for your new spinnaker domain to this new entry

    ```bash
    kubectl get ingress --namespace spinnaker
    ```

REMINDER:  This basic setup defaults with a SIMPLE username/password auth.  It's recommended to change
this from the default or better yet, use an identity provider (saml/oidc/ldap) solution. The spinnaker
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
to <https://github.com/spinnaker/spinnaker/blob/main/front50/front50-web/config/front50.yml>
path where each service has a `<service>/<service>-web/config/<service>.yml` file defining defaults.

> __Note__: Local Debian installation requires a recent ubuntu/debian and installation of components like kubectl
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

Congratulations, you have a basic Spinnaker installation. You can

* Integrate with [Cloud Providers](/docs/setup/install/providers/)
* check the [deploy Spinnaker](/docs/setup/install/deploy/) references
