---

title:  "Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE) Setup"
linkTitle: Oracle K8s
description: Deploy to OKE using the Kubernetes provider for Spinnaker. 
---



This page describes how to set up a Kubernetes cluster on
[OKE](https://cloud.oracle.com/containers/kubernetes-engine/) to be used with Spinnaker's
Kubernetes provider. 

## Create a cluster

If you don't already have a cluster for this purpose, you can create a
Kubernetes cluster on OKE by following [this tutorial](https://www.oracle.com/webfolder/technetwork/tutorials/obe/oci/oke-full/index.html).

## Download kubectl configuration file

Follow [the instructions](https://www.oracle.com/webfolder/technetwork/tutorials/obe/oci/oke-full/index.html#DownloadthekubeconfigFilefortheCluster)
to download kubectl configuration file.

## Store the config file in a secret that spinnaker can reference
```shell
kubectl create secret generic my-secret --from-file=kubeconfig-my-account=./kubeconfig
```
For additional entries you may need to determine an alternative strategy or use
an [external secrets manager](/docs/reference/secrets/) instead of directly mounting secrets onto pods.

## Enable Kubernetes Cloud provider

Like any other kubernetes account, add the configuration to `clouddriver-local.yml`


```yaml
kubernetes:
  enabled: true
  accounts:
    - name: my-k8s-acct
      kubeconfig: /mnt/kubeconfigs/kubeconfig-my-accoun
```
Finally, enable [artifact support](/docs/reference/artifacts/#enabling-artifact-support).
