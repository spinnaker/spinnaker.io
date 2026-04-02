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

# Halyard deprecation notice
Halyard was previously mentioned on this page, and is deprecated in favor
of native installation using kustomize or similar native configurations.  References
to halyard are being steadily removed from the project.  An example of a script to export
a halyard or operator deployed spinnaker into kustomize style deployment has been published here:
https://docs.armory.io/continuous-deployment/spinnaker-user-guides/armory-operator-to-kustomize-migration/

## What you'll need to install spinnaker

* A kubernetes cluster

  This can be any of the supported vendor solutions (AKS/EKS/GKE/etc.) or an on-premise kubernetes cluster.
  Make sure it has at least 18GB of memory and 6 cores.  Spinnaker uses memory depending upon
  configuration and the number of "accounts" registered with spinnaker

* Kustomize or kubectl with kustomize integrated

You can also install [on a single local machine](https://www.spinnaker.io/setup/install/environment/#local-debian), or [for Spinnaker development](https://www.spinnaker.io/setup/install/environment/#local-git), making sure you have the 4 cores and 16GB in each case. 

## The process

Installing a complete Spinnaker involves these steps:
1. [Choose a cloud provider](/docs/setup/install/providers/)
1. [Choose an installation method](/docs/setup/install/environment/)
1. [Configure the database for storage](/docs/setup/install/storage/)
1. [Deploy Spinnaker](/docs/setup/install/deploy/)
1. [Configure everything else](/docs/setup/other_config/) 
1. [Productionize Spinnaker](/docs/setup/productionize/)

It is HIGHTLY recommended to at LEAST setup security for spinnaker!

## And then what?

[Get started using Spinnaker](/docs/guides/user/get-started)
