---
title: 'Kubernetes V2 Provider'
linkTitle: 'Kubernetes'
weight: 2
description: The Kubernetes V2 Provider is the standard Kubernetes provider for Spinnaker. You can use it to deploy applications to a Kubernetes cluster.
---

Spinnaker's Kubernetes provider fully supports Kubernetes-native, manifest-based deployments and is the recommended provider for deploying to Kubernetes with Spinnaker.

## Accounts

A Spinnaker [Account]({{< ref "concepts-providers#accounts" >}}) maps to a
credential that can authenticate against your Kubernetes Cluster.

## Prerequisites

The Kubernetes provider has two requirements:

- A [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file

  The `kubeconfig` file allows Spinnaker to authenticate against your cluster
  and to have read/write access to any resources you expect it to manage. 
  You can request this from your Kubernetes cluster administrator.  Deployment systems
  will copy your kubeconfig file into your spinnaker iinstallation so anything
  you add to the kubeconfig must work remotely in a target environment WITHOUT needing your
  local settings or permisisons
  - Example:  You may use very different permissions in EKS using Node IAM permissions where locally you may use aws-iam-authenticator and your
  personal AWS permissions.

- [kubectl](https://kubernetes.io/docs/user-guide/kubectl/) CLI tool

  Spinnaker relies on `kubectl` to manage all API access. It's installed
  along with Spinnaker.

  Spinnaker also relies on `kubectl` to access your Kubernetes cluster; only
  `kubectl` fully supports many aspects of the Kubernetes API, such as 3-way
  merges on `kubectl apply`, and API discovery. Though this creates a
  dependency on a binary, the good news is that any authentication method or
  API resource that `kubectl` supports is also supported by Spinnaker. This
  is an improvement over the original Kubernetes provider in Spinnaker.

### Create a Kubernetes Service Account

See the kubernetes docs on creating [Kubernetes Service
Account](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/),
It's recommended that you create dedicated permissions in your target environments
for spinnaker to access resources.  

### Configure Kubernetes roles (RBAC)

The following YAML creates the correct `ClusterRole`, `ClusterRoleBinding`, and
`ServiceAccount`. If you limit Spinnaker to operating on an explicit list of
namespaces (using the `namespaces` option), you need to use `Role` and
`RoleBinding` instead of `ClusterRole` and `ClusterRoleBinding`, and apply the
`Role` and `RoleBinding` to each namespace Spinnaker manages. You can read
about the difference between `ClusterRole` and `Role`
[in the Kubernetes docs](https://kubernetes.io/docs/admin/authorization/rbac/#rolebinding-and-clusterrolebinding).
If you're using RBAC to restrict the Spinnaker service account to a particular namespace,
you must specify that namespace when you add the account to Spinnaker.
If you don't specify any namespaces, then Spinnaker will attempt to list all namespaces,
which requires a cluster-wide role.

<span class="begin-collapsible-section"></span>
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: spinnaker-role
rules:
  - apiGroups: ['']
    resources:
      [
        'namespaces',
        'configmaps',
        'events',
        'replicationcontrollers',
        'serviceaccounts',
        'pods/log',
      ]
    verbs: ['get', 'list']
  - apiGroups: ['']
    resources: ['pods', 'services', 'secrets']
    verbs:
      [
        'create',
        'delete',
        'deletecollection',
        'get',
        'list',
        'patch',
        'update',
        'watch',
      ]
  - apiGroups: ['autoscaling']
    resources: ['horizontalpodautoscalers']
    verbs: ['list', 'get']
  - apiGroups: ['apps']
    resources: ['controllerrevisions']
    verbs: ['list']
  - apiGroups: ['extensions', 'apps']
    resources: ['daemonsets', 'deployments', 'deployments/scale', 'ingresses', 'replicasets', 'statefulsets']
    verbs:
      [
        'create',
        'delete',
        'deletecollection',
        'get',
        'list',
        'patch',
        'update',
        'watch',
      ]
  # These permissions are necessary for halyard to operate. We use this role also to deploy Spinnaker itself.
  - apiGroups: ['']
    resources: ['services/proxy', 'pods/portforward']
    verbs:
      [
        'create',
        'delete',
        'deletecollection',
        'get',
        'list',
        'patch',
        'update',
        'watch',
      ]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: spinnaker-role-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: spinnaker-role
subjects:
  - namespace: spinnaker
    kind: ServiceAccount
    name: spinnaker-service-account
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: spinnaker-service-account
  namespace: spinnaker
```

<span class="end-collapsible-section"></span>

## Create a kubeconfig file 

Creating the correct kubeconfig for deployment to kubernetes is out of scope of these docs.  It's
recommended that you work with kubernetes admins or kubernetes experts to correctly generate
a kubeconfig for spinnaker to access from one kubernetes cluster to your target cluster.  

When using Halyard, this kubeconfig is used to deploy spinnaker to a target cluster but can ALSO
be used by spinnaker IN your target cluster to connect to that Provider as well.  

When using operator based deploys or kustomize based deploys, you will not need this kubeconfig file for 
deploying into a cluster.  Instead, the kubeconfig  would be used for spinnaker pipelines to deploy 
to a provider.
<span class="end-collapsible-section"></span>

## Add your kubernetes cluster as a provider

First, make sure that the provider is enabled:

```bash
hal config provider kubernetes enable
```

Then add the account:

```bash
CONTEXT=$(kubectl config current-context)
SPINNAKER_ACCOUNT_NAME=my-k8s-account
hal config provider kubernetes account add $SPINNAKER_ACCOUNT_NAME --context $CONTEXT
```

Finally, enable [artifact support]({{< ref "ref-artifacts#enabling-artifact-support" >}}).

## Advanced account settings

If you're looking for more configurability, please see the other options listed
in the [Halyard Reference]({{< ref "commands#hal-config-provider-kubernetes-account-add" >}}) or
docs in the supported deployment method.
