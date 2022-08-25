---
title: "Install and Configure Spinnaker"
linkTitle: "Install"
weight: 10
description: >
  Describes how to install and set up Spinnaker so that it can be configured for use in production.
---

This section describes how to install and set up Spinnaker so that it can be configured for
use in production. If you just want to evaluate Spinnaker without much work, one of the options
in [Quickstart](/docs/setup/quickstart/) might be a better choice.

## What you'll need

* A machine on which to install Halyard

  This can be a local machine or VM (Ubuntu 18.04 or higher,
  Debian 10 or higher), or it can be a Docker container.
  Make sure it has at least 12GB of memory.

* A Kubernetes cluster on which to install Spinnaker itself

  We recommend at least 4 cores and 16GB of RAM available in the cluster. 

You can also install [on a single local machine](https://www.spinnaker.io/setup/install/environment/#local-debian), or [for Spinnaker development](https://www.spinnaker.io/setup/install/environment/#local-git), making sure you have the 4 cores and 16GB in each case. 

## The process

Installing a complete Spinnaker involves these steps:
1. [Install Halyard](/docs/setup/install/halyard/)
1. [Choose a cloud provider](/docs/setup/install/providers/)
1. [Choose an environment](/docs/setup/install/environment/)
1. [Choose a storage service](/docs/setup/install/storage/)
1. [Deploy Spinnaker](/docs/setup/install/deploy/)
1. [Back up your config](/docs/setup/install/backups/)
1. [Configure everything else](/docs/setup/other_config/) (which includes a lot of
  stuff you need before you can use Spinnaker in production)
1. [Productionize Spinnaker](/docs/setup/productionize/) (which mainly helps you
  configure Spinnaker to scale for production)

## And then what?

[Get started using Spinnaker](/docs/guides/user/get-started)
