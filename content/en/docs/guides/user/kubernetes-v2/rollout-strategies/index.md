---
title: "Rollout Strategies"
linkTitle: "Rollout Strategies"
description: >
  Use a dark, Highlander, or blue/green rollout strategy in the Kubernetes provider.
---

This guide describes how to take advantage of the
[Kubernetes](/docs/setup/install/providers/kubernetes-v2) provider's first-class support for common rollout strategies, including dark, highlander, and blue/green rollouts.

>The implementation of these rollout strategies currently leverages Spinnaker's existing traffic management strategy and is valid for ReplicaSets only. See [traffic management]({{< ref "docs/guides/user/kubernetes-v2/traffic-management/index.md" >}}) for more information.

## Rollout Strategy Options

As of version 1.14, you will notice a Rollout Strategy Options section in the Deploy (Manifest)
stage. When enabled, these configuration options allow you to associate a workload with one or
more services, decide whether the workload should receive traffic, and determine how Spinnaker
should handle any previous versions of the workload in the same cluster and namespace.

Configuration options:

- __Service namespace__

  Select the namespace containing the service(s) you would like to associate with the workload.

- __Service(s)__

  Select one or more services you would like to associate with the workload. Spinnaker will
  add a `traffic.spinnaker.io/load-balancers` annotation listing the selected services as
  described [here](/docs/guides/user/kubernetes-v2/traffic-management/#attach-a-service-to-a-workload).

- __Traffic__

  Check this box if you would like the workload to begin receiving traffic from the selected
  services as soon as it is ready. If you do not check this box, you can add a subsequent
  Enable (Manifest) stage to begin sending traffic to the workload.

- __Strategy__

  Select a strategy if you would like Spinnaker to handle previous versions of the workload
  currently deployed to the same cluster and namespace. Select `None` if you do not want
  Spinnaker to take any action regarding existing workloads.  


### Dark Rollouts

Use a dark rollout to deploy a new version of your application alongside the existing version(s),
but do not immediately route any traffic to the new version.

Optionally, add subsequent Enable (Manifest) and Disable (Manifest) stage to begin sending traffic
to the new version and stop sending traffic to the old version(s).

Example configuration:

{{< figure src="./dark.png" >}}

### Highlander Rollouts

Use a highlander rollout to deploy a new version of your application alongside the existing
version(s), send client traffic to the new version, and then disable and destroy existing versions
in the cluster.

Example configuration:

{{< figure src="./highlander.png" >}}

### Red/Black (Blue/Green) Rollouts

Use a red/black (blue/green) rollout to deploy a new version of your application alongside the existing version(s), send client traffic to the new version, and then disable existing versions in the cluster.

Optionally, add subsequent Destroy (Manifest) stages to clean up any unwanted workloads in the
cluster.

Alternately, easily roll back to a previous version by configuring an Enable (Manifest) stage or using an ad-hoc Enable operation from the Clusters tab.

Example configuration:

{{< figure src="./redblack.png" >}}

>Blue/Green replaces Red/Black in Spinnaker v1.30+.