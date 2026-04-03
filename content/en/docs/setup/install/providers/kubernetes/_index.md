---
title: 'Kubernetes V2 Provider'
linkTitle: 'Kubernetes'
weight: 2
description: The Kubernetes V2 Provider is the standard Kubernetes provider for Spinnaker. You can use it to deploy applications to a Kubernetes cluster.
---

Spinnaker's Kubernetes provider fully supports Kubernetes-native, manifest-based deployments and is the recommended
provider for deploying to Kubernetes with Spinnaker.

## Accounts

A Spinnaker [Account]({{< ref "concepts-providers#accounts" >}}) maps to a
credential that can authenticate against your Kubernetes Cluster.

## Prerequisites

The Kubernetes provider has two requirements:

- A [kubeconfig](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file

  The `kubeconfig` file allows Spinnaker to authenticate against your cluster
  and to have read/write access to any resources you expect it to manage. You
  can think of it as private key file to let Spinnaker connect to your cluster.
  You can request this from your Kubernetes cluster administrator.

- [kubectl](https://kubernetes.io/docs/user-guide/kubectl/) CLI tool

  Spinnaker relies on `kubectl` to manage all API access. It's installed
  along with Spinnaker.

  Spinnaker also relies on `kubectl` to access your Kubernetes cluster; only
  `kubectl` fully supports many aspects of the Kubernetes API, such as 3-way
  merges on `kubectl apply`, and API discovery. Though this creates a
  dependency on a binary, the good news is that any authentication method or
  API resource that `kubectl` supports is also supported by Spinnaker. This
  is an improvement over the original Kubernetes provider in Spinnaker.

<span class="begin-collapsible-section"></span>

### Optional: Create a Kubernetes Service Account

If you want, you can associate Spinnaker with a [Kubernetes Service
Account](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/),
even when managing multiple Kubernetes clusters. This can be useful if you need
to grant Spinnaker certain roles in the cluster later on, or you typically
depend on an authentication mechanism that doesn't work in all environments.

Given that you want to create a Service Account in existing context `$CONTEXT`,
the following commands will create `spinnaker-service-account`, and add its
token under a new user called `${CONTEXT}-token-user` in context `$CONTEXT`.

```bash
CONTEXT=$(kubectl config current-context)

# This service account uses the ClusterAdmin role -- this is not necessary,
# more restrictive roles can by applied.
kubectl apply --context $CONTEXT \
    -f {{< link "downloads/kubernetes/service-account.yml" >}}

TOKEN=$(kubectl get secret --context $CONTEXT \
   $(kubectl get serviceaccount spinnaker-service-account \
       --context $CONTEXT \
       -n spinnaker \
       -o jsonpath='{.secrets[0].name}') \
   -n spinnaker \
   -o jsonpath='{.data.token}' | base64 --decode)

kubectl config set-credentials ${CONTEXT}-token-user --token $TOKEN

kubectl config set-context $CONTEXT --user ${CONTEXT}-token-user
```

<span class="end-collapsible-section"></span>

<span class="begin-collapsible-section"></span>

### Optional: Configure Kubernetes roles (RBAC)

If your Kubernetes cluster supports
[RBAC](https://kubernetes.io/docs/admin/authorization/rbac/)
and you want to restrict permissions granted to your Spinnaker account, you
will need to follow the below instructions.

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

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: spinnaker-role
rules:
  - apiGroups: [ '' ]
    resources:
      [
        'namespaces',
        'configmaps',
        'events',
        'replicationcontrollers',
        'serviceaccounts',
        'pods/log',
      ]
    verbs: [ 'get', 'list' ]
  - apiGroups: [ '' ]
    resources: [ 'pods', 'services', 'secrets' ]
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
  - apiGroups: [ 'autoscaling' ]
    resources: [ 'horizontalpodautoscalers' ]
    verbs: [ 'list', 'get' ]
  - apiGroups: [ 'apps' ]
    resources: [ 'controllerrevisions' ]
    verbs: [ 'list' ]
  - apiGroups: [ 'extensions', 'apps' ]
    resources: [ 'daemonsets', 'deployments', 'deployments/scale', 'ingresses', 'replicasets', 'statefulsets' ]
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

## Adding an account

Add the following config to clouddriver-local.yml

```yaml
kubernetes:
  enabled: true
  loadNamespacesInAccount: false
  verifyAccountHealth: false
  accounts:
    - name: k8s-example
      kubeconfigFile: /mnt/configs/k8s-example-kubeconfig
      kubectlExecutable: kubectl-1.29
      cacheIntervalSeconds: 60
      namespaces:
        - spinnaker
      permissions:
        READ:
          - everyone
          - engineering-managed
        WRITE:
          - everyone
          - engineering-managed
```

Finally, enable [artifact support](/docs/reference/artifacts/#enabling-artifact-support).

## Advanced account settings

If you're looking for more configurability, please see
the [code for a kubernetes account definition](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/config/KubernetesAccountProperties.java)
