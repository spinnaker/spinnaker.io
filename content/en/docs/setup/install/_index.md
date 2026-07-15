---
title: "Install and Configure Spinnaker"
linkTitle: "Install"
weight: 10
description: >
  Describes how to install and set up Spinnaker
---

## Requirements to install spinnaker

* A kubernetes cluster

  This can be any of the supported vendor solutions (AKS/EKS/GKE/etc.) or an on-premise kubernetes cluster.
  Make sure it has at least 18GB of memory and 6 cores.  Spinnaker uses memory depending upon
  configuration and the number of "accounts" registered with spinnaker

* [kubectl](https://kubernetes.io/docs/reference/kubectl/) with kustomize integrated
* Kubernetes native configuration management [Kustomize](https://kustomize.io/)

## The process

Installing a complete Spinnaker involves these steps:

### Install spinnaker

* [Choose an installation method](/docs/setup/install/environment/)
* [Deploy Spinnaker](/docs/setup/install/deploy/)

### Configure spinnaker

* [Choose a cloud provider](/docs/setup/install/providers/)
* [Configure a database for storage](/docs/setup/install/storage/)
* [Configure everything else](/docs/setup/other_config/)
* [Productionize Spinnaker](/docs/setup/productionize/)

It is HIGHLY recommended to at LEAST setup authentication for spinnaker!

---

## Halyard deprecation notice

{{% alert color="warning" title="Important" %}}
Halyard `hal` is deprecated.
{{% /alert %}}

Halyard was previously mentioned on this page, and is deprecated in favor
of native installation using [kustomize](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/) native configurations.

References to halyard are being steadily removed from the project.  An [example script](/docs/setup/install/migration-to-kustomize-automation/) is available to export
a halyard or operator deployed spinnaker into kustomize style deployment.

---

## And then what?
