---
title: "Google Cloud Run"
linkTitle: "Google Cloud Run"
description: Learn how Spinnaker functionality maps to Google Cloud Run.
---

> If you are not familiar with Cloud Run or any of the terms used below, please consult Cloud Run's [reference documentation](https://cloud.google.com/run/docs).

## Resource mapping

### Account
A Spinnaker **account** maps to a single Cloud Run **application**, a top-level resource that contains
services, versions, and instances. Spinnaker authenticates itself with Cloud Run
using service account credentials for a Google Cloud Platform project -
see the [setup guide](/docs/setup/install/providers/cloudrun).

### Load Balancer
A Spinnaker **load balancer** maps to an Cloud Run **service**.

A service has many versions (discussed [below](#server-group)), and a version's `app.yaml` determines the service
it belongs to. If a version's `app.yaml` does not specify the name of a service, it will be deployed to the service named `default`.

Spinnaker cannot create a service, but if a service does not exist when a version is deployed, it will be created automatically.

A service's **traffic split** determines how incoming traffic is allocated between versions.

### Server Group
A Spinnaker **server group** maps to an Cloud Run **version**. An `app.yaml` file (which typically lives alongside your application source code) determines
a version's configuration. If necessary, you can provide Spinnaker with the contents of an `app.yaml`
file when you deploy a version.


### Instance
A Spinnaker **instance** maps to an Cloud Run **instance**.

## Operation mapping

### Deploy

Deploys an Cloud Run version.

At a high level, deploying to Cloud Run using Spinnaker has three steps:

1. You provide Spinnaker with a reference to a git repository, and some information about where your application lives
   inside that repository (e.g., branch).
2. Spinnaker clones your repository and finds your application.
3. Spinnaker deploys your application to a new version by executing `gcloud run deploy`.

If your pipeline includes a Deploy stage and has been triggered by a webhook or Jenkins job, you can dynamically resolve the git repository branch that Spinnaker uses to deploy.

### Destroy

Destroys a version.

If a version is serving traffic, it will first be [disabled](#disable).

You cannot destroy a version if it is the only version serving traffic from a service.

### Enable

Sets a version's traffic allocation to 100%.

This operation is provided as a convenience method. If
you would like more fine-grained control over your versions' traffic allocations, see [Edit Load Balancer](#edit-load-balancer).

### Disable

Sets a version's traffic allocation to 0%, and sets the other enabled versions' allocations to their
relative proportions before the disable operation.

This operation is provided as a convenience method, and because it is used implicitly when destroying a version. If you would like more fine-grained control over your versions' traffic allocations, see [Edit Load Balancer](#edit-load-balancer).

You cannot disable a version if it is the only version serving traffic from a service.

### Start

Starts an Cloud Run version - i.e., allows a version to scale according to its scaling policy.

This operation is only available if the version uses manual or basic scaling, or is running in the flexible environment.

### Stop

Stops an Cloud Run version - i.e., scales a version down to zero instances.

This operation is only available if the version uses manual or basic scaling, or is running in the flexible environment.

### Edit Load Balancer

Edits a service's traffic split - i.e., the relative proportion of traffic that each version receives.

If your pipeline includes an Edit Load Balancer stage, you can resolve the targets of a traffic split dynamically.

### Delete Load Balancer

Deletes a service. Deleting a service will also delete all of its versions.

You cannot delete the `default` service. However, you can disable your Cloud Run application from within the
[Google Cloud Console](https://console.cloud.google.com).

### Terminate instance

Deletes an instance.
