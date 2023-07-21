---
title: "Use Kustomize for Manifests"
linkTitle: "Use Kustomize for Manifests"
description: >
  Use Kustomize to generate a custom manifest to use in your Deploy (Manifest) stage.
---

Kustomize is a tool that lets you create customized Kubernetes deployments without modifying underlying YAML configuration files. Since the files remain unchanged, others are able to reuse the same files to build their own customizations. Your customizations are stored in a file called `kustomization.yaml`. If configuration changes are needed, the underlying YAML files and `kustomization.yaml` can be updated independently of each other.

To learn more about Kustomize and how to define a `kustomization.yaml` file, see the following links:

* [Kubernetes SIG for Kustomize](https://github.com/kubernetes-sigs/kustomize)
* [Documentation for Kustomize](https://kubernetes-sigs.github.io/kustomize/)
* [Example Kustomization](https://github.com/kubernetes-sigs/kustomize/tree/master/examples/wordpress)

In the context of Spinnaker, Kustomize lets you generate a custom manifest, which can be deployed in a downstream `Deploy (Manifest)` stage. This manifest is tailored to your requirements and built on existing configurations.

## Enabling Kustomize Prior to 1.20

Kustomize must be enabled by a feature flag in Spinnaker 1.16 - 1.19.

For Halyard, add the following line to `~/.hal/{DEPLOYMENT_NAME}/profiles/settings-local.js`:

```javascript
window.spinnakerSettings.feature.kustomizeEnabled = true;
```

## Overview

Kustomize works by running `kustomize build` against a `kustomization.yaml` file located in a Git repository. This file defines all of the other files needed by Kustomize to render a fully hydrated manifest.

Kustomize support was added to Spinnaker in 1.16. However, the instructions for using Kustomize vary between Spinnaker 1.16 and 1.17+.

## Configure the “Bake (Manifest)” stage

### Using Spinnaker 1.17+

>Note: Kustomize in 1.17+ requires the [git/repo](/docs/reference/artifacts/types/git-repo/) artifact type.**


Select `Kustomize` as the Render Engine and define the artifact for your `kustomization.yaml`.

You can specify the following:

* __Account__ (required)

  The `git/repo` account to use.

* __URL__ (required)

  The location of the Git repository.

* __Branch__ (optional)

  The branch of the repository you want to use. _[Defaults to `master`]_

* __Subpath__ (optional)

  By clicking `Checkout subpath`, you can optionally pass in a
  relative subpath within the repository. This provides the option
  to checkout only a portion of the repository, thereby reducing the
  size of the generated artifact.

* __Kustomize File__ (required)

  The relative path to the `kustomization.yaml` file residing in the
  Git repository.

{{< figure src="./render-engine-gitrepo.png" >}}

### Using Spinnaker 1.16

Select `Kustomize` as the Render Engine and define the artifact for your `kustomization.yaml`:

{{< figure src="./render-engine-github.png" >}}

## Configuring the Produced Artifact

With the `Bake (Manifest) Configuration` completed, configure a Produced Artifact to use the result in a stage downstream.
Add an artifact:

{{< figure src="./add-artifact.png" >}}

Define the artifact:

{{< figure src="./define-artifact.png" >}}

You can now run your pipeline and get a Kustomize rendered manifest!

## Updating 1.16 "Bake (Manifest)" stage for 1.17

As of 1.17, [git/repo](/docs/reference/artifacts/types/git-repo/) is the only supported artifact type when configuring the `Bake (Manifest)` stage in the UI with `Kustomize`.

Pipelines configured to use Kustomize in 1.16 will continue to work in 1.17. However, editing a `Bake (Manifest)` stage in 1.17, which was originally created in 1.16, requires you to update the `Bake (Manifest) Configuration` to use the `git/repo` artifact type.  To do so, use the following instructions:

1. Click on the `Account` dropdown and select a configured `git/repo` account.  If none appear, make sure you have [configured a git/repo account](/docs/reference/artifacts/types/git-repo/)  
__Note:__ You should click and select a `git/repo` account even if one already appears in the UI prior to your doing so. This will force the underlying JSON to be updated to use the new artifact.

1. Update the URL. This should be the location of the git repository.  
__example__: `https://github.com/kubernetes-sigs/kustomize`

1. Provide the Kustomize file path. This should be the relative path to the `kustomization.yaml` within the repository.  
__example__: `examples/wordpress/mysql/kustomization.yaml`

{{< figure src="./render-engine-pre-migration.png" caption="Before updating. The fields highlighed in red should be updated as described above." >}}

{{< figure src="./render-engine-post-migration.png" caption="After updating." >}}


## Other Templating Engines

In addition to Kustomize, Spinnaker also supports Helm (and Helmfile) as templating engines. For more information, see [Deploy Helm Charts](/docs/guides/user/kubernetes-v2/deploy-helm/).
