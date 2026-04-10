---
title: 'Set up the Kubernetes provider for Amazon EKS'
linkTitle: 'EKS'
description: >
  Set up Spinnaker on AWS EKS using the Kubernetes provider
---

> Before you proceed further with this setup, we strongly recommend that you familiarize yourself
> with [Amazon EKS concepts](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html).
> Also, visit
> the [AWS global infrastructure region table](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)
> for the most up-to-date information on Amazon EKS regional availability.

These instructions assume that you have AWS
CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) on an Ubuntu machine
running on AWS EC2.

## Preparing to install Spinnaker on EKS

The following steps describes how to the tools you need to install and manage Spinnaker and EKS.

### 1. Install and configure kubectl

Install `kubectl` to manage Kubernetes and `aws-iam-authenticator` to manage cluster authentication:

```
# Download and install kubectl
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

# Verify the installation of kubectl
kubectl help

# Download and install aws-iam-authenticator
curl -o aws-iam-authenticator https://amazon-eks.s3-us-west-2.amazonaws.com/1.13.7/2019-06-11/bin/linux/amd64/aws-iam-authenticator
chmod +x ./aws-iam-authenticator
mkdir -p $HOME/bin && cp ./aws-iam-authenticator $HOME/bin/aws-iam-authenticator && export PATH=$HOME/bin:$PATH
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc

#Verify the installation of aws-iam-authenticator
aws-iam-authenticator help
```

The commands return the help information for `kubectl` and `aws-iam-authenticator` respectively. If the help for either
tool does not get returned, verify that you have installed the tool.

### 2. Install awscli

```
# Install the awscli
sudo apt install python-pip awscli

# Verify the installation
aws --version
```

The command returns the `awscli` version.

### 3. Install eksctl

Install `eksctl` to manage EKS clusters from the command line. Current versions
and installation instructions are available here: https://github.com/eksctl-io/eksctl

### 4. Create the Amazon EKS cluster for Spinnaker

```
eksctl create cluster --name=eks-spinnaker --nodes=2 --region=us-west-2 --write-kubeconfig=false
```

## Install and configure Spinnaker

This section walks you through the process of installing and configuring Spinnaker for use with Amazon EKS.

### 1. Retrieve Amazon EKS cluster kubectl contexts

```
aws eks update-kubeconfig --name eks-spinnaker --region us-west-2 --alias eks-spinnaker
```

### 2. Add and configure deployment accounts

See https://spinnaker.io/docs/setup/install/providers/ for instructions

### 3. Enable artifact support

[Add artifacts](../../../other_config/artifacts) which allow loading from a git repository to do helm/kustomize bakes,
fetching a single manifest file from git APIs or other resources used for deployments

### 4. Deploy spinnaker
See the [instructions](../../environment/) around a kubernetes installation
using kustomize

### 5. Verify the Spinnaker installation

```
kubectl -n spinnaker get svc
```

The command returns the Spinnaker services that are in the `spinnaker` namespace.

### 9. Expose Spinnaker using Elastic Load Balancer

Expose the Spinnaker API (Gate) and the Spinnaker UI (Deck) using Load Balancers by running the following commands to
create the `spin-gate-public` and `spin-deck-public services`:

```
export NAMESPACE=spinnaker
# Expose Gate and Deck
kubectl -n ${NAMESPACE} expose service spin-gate --type LoadBalancer \
  --port 80 --target-port 8084 --name spin-gate-public

kubectl -n ${NAMESPACE} expose service spin-deck --type LoadBalancer \
  --port 80 --target-port 9000 --name spin-deck-public

export API_URL=$(kubectl -n $NAMESPACE get svc spin-gate-public \
 -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

export UI_URL=$(kubectl -n $NAMESPACE get svc spin-deck-public \
 -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
```

# Configure the URL for Gate in deck by adding an entry in settings-local.js
```javascript
window.settings.gateUrl = 'https://spinnaker.example.com:8084';
```

# Configure the URL for Deck in gate-local.yml:
```yaml
services:
  deck:
    baseUrl: http://spinnaker.example.com:9000
```

# Apply your changes to Spinnaker
```shell
kubectl kustomize -o spinnaker.yaml
kubectl apply -f spinnaker.yaml
kubectl -n spinnaker get pods
```

### 10. Re-verify the Spinnaker installation

Run the following command to verify that the Spinnaker services are present in the cluster:

```
kubectl -n spinnaker get svc
```

### 11. Log in to Spinnaker console

Get the URL to Deck, the UI.

```
kubectl -n $NAMESPACE get svc spin-deck-public -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
Point this to the URL OR adjust the gate URls to use the above hostnames. Navigate to the URL in a supported browser and log in.
