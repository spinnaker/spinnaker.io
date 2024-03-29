---
title:  "Kubernetes CRD Extensions"
description: >
  Explains extension points for deep CRD integrations within Spinnaker.
---

## Spinnaker Extension Points for Custom Resource Definitions

At Google, we've built extension points for deep CRD integrations within Spinnaker.

This work has allowed us to support the following features within Spinnaker:

 - Custom models for representing CRDs as `spinnakerKinds`
 - Deploying CRDs with custom Spinnaker artifact types
 - Custom Kubernetes API versions
 - Custom Spinnaker naming strategies
 - Per-account, custom Spinnaker UIs that can run alongside the existing Kubernetes UIs

This guide is for developers who want to duplicate this functionality for their CRDs.
It also exists as an explanation of certain code paths within Spinnaker which include hooks with no current corresponding open-source implementations.

Developers who want to implement these features will have to build their own layered version
of [Clouddriver](https://github.com/spinnaker/clouddriver) -
  see Adam Jorden's [blog post](https://blog.spinnaker.io/scaling-spinnaker-at-netflix-custom-features-and-packaging-e78536d38040) - and should be familiar with the [Kubernetes provider](/reference/providers/kubernetes-v2) and writing code for Clouddriver.

## Custom Handlers

The central extension point is the [KubernetesHandler](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/op/handler/KubernetesHandler.java) class. A subclass of `KubernetesHandler` - e.g., [KubernetesReplicaSetHandler](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/op/handler/KubernetesReplicaSetHandler.java) - defines the
relationship between Spinnaker and your Kubernetes kind.

For example, if you wanted to build a Spinnaker integration for your CRD of kind `MyCRDKind`, you would start with
the following handler:

```java
@Component
public class MyCRDHandler extends KubernetesHandler {

  public MyCRDHandler() {
    // Hook point for registering a custom `ArtifactReplacer`
    // for your CRD. During a deploy operation,
    // if an artifact of the type specified in the replacer is present,
    // the artifact will be inserted into the manifest using the
    // strategy described in the replacer.
  }

  @Override
  public KubernetesKind kind() {
    return KubernetesKind.from("MyCRDKind");
  }

  @Override
  public boolean versioned() {
    // If the CRD resource should be versioned - i.e., assigned a sequence
    // v001, v002, etc.
    return false;
  }

  @Override
  public SpinnakerKind spinnakerKind() {
    // The Spinnaker kind that the resource will be represented as in Spinnaker's API and UI.
    return SpinnakerKind.SERVER_GROUPS;
  }

  @Override
  public Status status(KubernetesManifest manifest) {
    // Includes logic for determining whether your CRD manifest is stable.
    // A deploy manifest operation, for example, will block until this
    // method returns a stable status.
  }

  @Override
  public KubernetesV2CachingAgentFactory cachingAgentFactory() {
    return KubernetesCoreCachingAgent::new;
  }
}
```

## Custom Spinnaker Resource Models

You may want to change how their CRD is represented in Spinnaker's API. By default, a CRD of `spinnakerKind` `serverGroups` will
be represented with the model class [KubernetesV2ServerGroup](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-kubernetes/src/main/java/com/netflix/spinnaker/clouddriver/kubernetes/caching/view/model/KubernetesV2ServerGroup.java).

You may want to override this representation, for example, if you want to define how your server group's `region` is resolved.

To override the default model class, `MyCRDHandler` should implement `ServerGroupHandler` (or `ServerGroupManagerHandler` if your
resource is of `spinnakerKind` `serverGroupManagers`). You will be responsible for translating raw Spinnaker cache data into a
subclass of `KubernetesServerGroup`.

## Custom Kubernetes API Versions

If you want Spinnaker to support custom Kubernetes API versions, subclass `KubernetesApiVersion`.

For example,

```java
public class MyApiVersion extends KubernetesApiVersion {
  public static MY_BETA_API_VERSION = new MyApiVersion("myApiVersion/v1beta");

  public MyApiVersion(String name) {
    // Base class maintains state.
    super(name);
  }
}
```

## Custom Spinnaker Naming Strategies

To use a custom naming strategy for your CRD, implement [NamingStrategy](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-core/src/main/groovy/com/netflix/spinnaker/clouddriver/names/NamingStrategy.java). For example,

```java
@Component
public class MyManifestNamer implements NamingStrategy<KubernetesManifest> {
  @Override
  public String getName() {
    return "myManifestNamingStrategy";
  }

  @Override
  public void applyMoniker(KubernetesManifest manifest, Moniker moniker) {
    // Strategy for applying a Spinnaker `Moniker` to a Kubernetes
    // manifest prior to deployment.
  }

  @Override
  public Moniker deriveMoniker(KubernetesManifest manifest) {
    // Strategy for deriving a Spinnaker `Moniker` from a Kubernetes
    // manifest.
  }
}
```

This naming strategy can be referenced in a Kubernetes account config. For example:

```
kubernetes:
  accounts:
    - name: my-kubernetes-account
      namingStrategy: myManifestNamingStrategy
```

Be careful - this naming strategy will be applied to all manifests manipulated by this account.
