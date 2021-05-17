---
title: "Parameterize Kubernetes Manifests"
linkTitle: "Parameterize Kubernetes Manifests"
description: >
  Inject parameters into your Kubernetes manifest as it is deployed.
---

Spinnaker can inject context from the currently executing pipeline into your
manifests as they are deployed, whether they are deployed
[statically](/docs/guides/user/kubernetes-v2/deploy-manifest/#specify-manifests-statically)
or
[dynamically](/docs/guides/user/kubernetes-v2/deploy-manifest/#specify-manifests-dynamically).

This can be applied to a wide range of use-cases, but we will focus on using a
pipeline parameter to specify the target namespace.

## Configure your pipeline parameters

First, register a pipeline parameter in the "configuration" tab of the
pipeline editor (only the __Name__ is required):

{{< figure src="./parameter.png" >}}

> See more details on how to provide parameters to pipelines programmatically in
> the [webhooks](/docs/guides/user/pipeline/triggers/webhooks) page.

> Warning: there are several reserved parameter keys (names) that cause unexpected behavior and failures
> if overwritten by a pipeline parameter definition.
> See the [list of reserved parameter and evaluate variable key names](/docs/guides/user/pipeline/expressions#list-of-reserved-parameter-and-evaluate-variable-key-names).

## Configure your manifest

In this scenario, we're using a parameter to specify the manifest's namespace.
Edit your manifest so the `metadata` section contains:

```yaml
# ... other keys
metadata:
  namespace: '${ parameters.namespace }'
# other keys ...
```

> Keep in mind this manifest [can be stored in the pipeline, or in an external
> store such as GitHub](/docs/guides/user/kubernetes-v2/deploy-manifest).

When you go to run the pipeline by hand, you will see the following:

{{< figure src="./run.png" >}}

## Parameterizing non-string keys

When parameterizing a YAML value that's not a string (such as the replica
count), you will need to explicitly convert the evaluated expression [to the
correct type](/docs/reference/pipeline/expressions/#helper-functions).

If you were expecting the replica count to arrive in parameter `replicas`, you
would write:

```yaml
# ... other keys
spec:
  replicas: '${ #toInt( parameters.replicas ) }'
# other keys ...
```


## More advanced parameterization

Please read the [pipeline expressions guide](/docs/guides/user/pipeline/expressions).
