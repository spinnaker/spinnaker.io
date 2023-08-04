---
title: "Install and Configure Spinnaker"
linkTitle: "Install"
weight: 10
description: >
  Describes how to install and set up Spinnaker so that it can be configured for use in production.
---

This section describes how to install and set up Spinnaker so that it can be use in production. If
you just want to evaluate Spinnaker without much work, one of the options in
[Quickstart](/docs/setup/quickstart/) or a [Local installation](/docs/setup/install/local/) might be
a better choice.  It's recommended that you review the  [spinnaker architecture](/docs/reference/architecture) 
to understand how spinnaker operates before installation.

* [Distributed installation](#distributed-installation) on Kubernetes

  Halyard deploys each of Spinnaker's 
  separately. __This is highly recommended for use in production.__


## What you'll need

* A [SQL Databaase](/docs/setup/install/storage/)
  * MariaDB/MySQL are supported.  This includes various cloud provided databases like AWS RDS & Google's 
  * Postgresql is an option but not documented at this time (PRs welcome)

* An [external Redis server](/docs/setup/install/redis/)
  * The default install will include a local redis.  IT IS NOT recommended to use this but to externalize your redis to a more persistent solution.  Redis data does need to be persisted in production environments.

* A [Kubernetes cluster](/docs/setup/install/providers/kubernetes-v2/) on which to install Spinnaker
  * It's recommended to have at least 8 cores and 32GB of RAM available in the cluster. 
  * It's recommended to use SSDs or high IO disks (GP3) due to spinanker using kubectl for operations
  * You can deploy to k3s/microk8s or similar for on-prem but keep in mind avaialble capacity

* Supoprting infrastructure not all of which is documented here, but should be considered
  * DNS
  * Load balancers (ALB/Traefik/etc.)
  * SSL and certificates
  * Backups
  * ETC

>  Other installation targets may work but are not supported.  For large scale production Kubernetes is recommended:
>  * [Local development](https://www.spinnaker.io/setup/install/environment/#local-git)
>  * [Debian local](https://www.spinnaker.io/setup/install/environment/#local-debian) 
>  * [Vagrant example (uses local debian)](hhttps://github.com/ashleykleynhans/vagrant-jenkins-spinnaker/)

## Installation tools
There are several solutions around deploying spinnaker to kubernetes.  Please note that not all these solutions are officially supported at this time though several are well maintained by the community.
- [halyard](/docs/setup/install/halyard) Is a command line tool that has a CLI and API component.  Halyard creates a small, 
 headless Spinnaker to update Spinnaker and its microservices, ensuring zero-downtime updates.  This is the default 
 installation method.  This takes care of creating Kubernetes objects from halyard configuration files.  The community
 would like to replace this tool, but it's still the default installation method that works for most users.
- [Armory Spinnaker Operator for Kubernetes](https://github.com/armory/spinnaker-operator) is an open source Kubernetes
Operator for deploying and managing Spinnaker. You can install a basic version of Spinnaker or use Kustomize files for
advanced configuration.  There's a [configuration reference](https://docs.armory.io/continuous-deployment/installation/armory-operator/op-manifest-reference/)
that documents a large part of the available configuration of spinnaker. 
- [Kustomize native install](https://github.com/spinnaker/spinnaker-kustomize/) is a minimal install that provides
a native kubernetes deployment experience for the spinnaker microservices.  This provides a more native k8s deployment
without the need for helm or an operator or halyard CLI tooling.  Caution:  This uses things LIKE a mariadb driver which
is not currently available in the project by default.  

## The process
Installing a complete Spinnaker involves these steps (documented using Halyard):
1. [Install Halyard](/docs/setup/install/halyard/)
1. [Add a kubernetes Provider](/docs/setup/install/providers/kubernetes-v2/)
1. [Basic Settings](/docs/setup/install/install-config/)
1. [Configure storage(SQL & Redis)](/docs/setup/install/storage/)
1. [Deploy Spinnaker](/docs/setup/install/deploy/)
1. [Back up your config](/docs/setup/install/backups/)
1. [Configure everything else](/docs/setup/other_config/) (which includes a lot of
  stuff you need before you can use Spinnaker in production LIKE authentication and authorization)
1. [Productionize Spinnaker](/docs/setup/productionize/) (which mainly helps you
  configure Spinnaker to scale for production)

## And then what?

[Get started using Spinnaker](/docs/guides/user/get-started)
