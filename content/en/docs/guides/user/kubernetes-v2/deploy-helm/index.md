---
title: "Deploy Helm Charts"
linkTitle: "Deploy Helm Charts"
description: >
  Use Spinnaker to create Helm charts for your applications.
---

Spinnaker surfaces a **Bake (Manifest)** stage to turn templates into manifests
with the help of a templating engine. [Helm](https://helm.sh/) relies on the `helm template` command.
For more details, see `helm template --help`.

{{< alert color="warning" >}}
>This stage is intended to help you package and deploy applications that you own, one that are actively developing and redeploying frequently. It is not intended to serve as a one-time installation method for third-party packages. If that is your goal, it's better to call `helm install` once when bootstrapping your Kubernetes cluster.

Make sure that you have configured [artifact support](/docs/setup/other_config/artifacts/) in Spinnaker first. All Helm charts are fetched/stored as artifacts in Spinnaker. Read more in the [reference pages](/docs/reference/artifacts).
{{< /alert >}}

## Configure the Bake (Manifest) stage

When configuring the **Bake (Manifest)** stage using a Helm (Helm 2 or Helm 3) render engine, you can specify the following:

* __The release name__ (required)

   The Helm release name for this chart. This determines the name of the artifact produced by this stage.

   *Note*: this name overrides any changes you make to the name in the Produces Artifacts section.

* __The template artifact__ (required)

  The Helm chart that you deploy, stored remotely as a `.tar.gz` archive. You can produce this by running `helm package
  /path/to/chart`. For more details, `helm package --help`.

### Configure API versions and a Kubernetes version

To begin, you must set `API_VERSIONS_ENABLED` to `true`. This is an essential Deck environment variable that enables the functionality necessary to work with API versions and a Kubernetes version in your CD pipeline.

* __The capabilities apiVersions__ (optional)

  The `apiVersions` field in the `Capabilities` object represents a set of API versions that are dependent
  on the Kubernetes version. You can pass these API versions as an argument to the `--api-versions` parameter in the `helm template` command.
  This enables you to specify which Kubernetes API versions should be used when rendering your Helm templates.

* __The release kubeVersion__ (optional)

   The `kubeVersion` field in the `Capabilities` object signifies the Kubernetes version itself. You can pass this Kubernetes version as argument to the `--kube-version` parameter in the `helm template` command. It specifies the exact Kubernetes version you want to use when rendering your Helm templates.

   **Note**: Not all Helm charts contain apiVersions and kubeVersion definitions in their manifests. Make sure that your manifests contain the following code:

   ```yaml
   data: 
     apiVersions: {{ .Capabilities.ApiVersions }}
     kubeVersion: {{ .Capabilities.KubeVersion }}
   ```

   In this example, you have a fully configured **Bake (Manifest)** stage, including the **ApiVersions** and **KubeVersion** fields:

   {{< figure src="api-versions.png" >}}

* __The release namespace__ (optional)

   The Kubernetes namespace to install release into. If parameter is not specified, Spinnaker uses the default namespace.

   **Note**: Not all Helm charts contain namespace definitions in their manifests. Make sure that your manifests contain the following code:


   ```yaml
   metadata:
     namespace: {{ .Release.Namespace }}
   ```

* __Helm chart file path__ (optional)

   Helm chart file path is only relevant (and visible) when the template artifact is a git/repo artifact.  It specifies the directory path to Chart.yaml in the git repo. If absent, Spinnaker looks for Chart.yaml in the root directory of the git repo.

   Given: A git repo where your `Chart.yaml` is in: `sub/folder/Chart.yml` \
   Then: `helmChartFilePath: "sub/folder/"`

   **Note**: Leading slashes do not work in `helmChartFilePath`.

* __Zero or more override artifacts__ (optional)

   The files passed to `--values` parameter in the `helm template` command. Each is a remotely stored artifact representing a [Helm Value  File](https://helm.sh/docs/chart_template_guide/values_files/).

* __Statically specified overrides__

   The set of static key/value pairs that are passed as `--set` parameters to the `helm template` command.

### Configuration example 

In this example, you have a fully configured **Bake (Manifest)** stage:

{{< figure src="./bake-manifest-stage.png" >}}

Notice that in the **Produces Artifacts** section, Spinnaker has automatically created an `embedded/base64` artifact that is bound when the stage completes, representing the fully baked manifest set to be deployed downstream.

{{< figure src="./produces.png" >}}

If you are programatically generating stages, here is the JSON representation of the same stage:

```json
{
  "type": "bakeManifest",
  "templateRenderer": "HELM2",
  "name": "Bake nginx helm template",
  "outputName": "nginx",
  "inputArtifacts": [
    {
      "account": "gcs",
      "id": "template-id"
    },
    {
      "account": "gcs",
      "id": "value-id"
    }
  ],
  "overrides": {
    "replicas": "3"
  },
  "expectedArtifacts": [
    {
      "defaultArtifact": {},
      "id": "baked-template",
      "matchArtifact": {
        "kind": "base64",
        "name": "nginx",
        "type": "embedded/base64"
      },
      "useDefaultArtifact": false
    }
  ]
}
```

### Helmfile

In addition to standard Helm deployments, Spinnaker supports [Helmfile](https://helmfile.readthedocs.io/) as a templating engine. You can find the supported version in [Rosco's Dockerfile](https://github.com/spinnaker/rosco/blob/master/Dockerfile.slim#L7).

Configuring a Helmfile deployment follows the specification for standard helm chart deployments (defined above) with one exception - `helmChartFilePath` is substituted for `helmfileFilePath` and is specified as follows:

* __helmfile file path (optional)__

   `helmfile` file path is only relevant (and visible) when the template artifact is a git/repo artifact. It specifies the directory path to helmfile.yaml in the git repo. If absent, spinnaker looks for helmfile.yaml in the root directory of the git repo. 

   Given: A git repo where your `helmfile.yaml` is in: `sub/folder/helmfile.yml` \
   Then: `helmfileFilePath: "sub/folder/"`

   Note: Leading slashes do not work in `helmfileFilePath`.

## Configure a downstream deployment

Now that your manifest set has been baked by Helm, configure a downstream stage
(in the same pipeline or in one triggered by this pipeline) your **Deploy (Manifest)** stage to deploy the artifact produced by the **Bake (Manifest)** stage:

{{< figure src="./expected-artifact.png" >}}

> Note: Make sure to select "embedded-artifact" as the artifact account for
> your base64 manifest set. This is required to translate the manifest set into
> the format required by the deploy stage.

When this stage runs, you can see every resource in your Helm chart get deployed at once:

{{< figure src="./result.png" >}}

## Other Templating Engines

In addition to Helm, Spinnaker also supports Kustomize as a templating engine. For more information, see [Using Kustomize for Manifests](/docs/guides/user/kubernetes-v2/kustomize-manifests/).
