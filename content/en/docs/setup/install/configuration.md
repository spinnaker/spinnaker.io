---
title:  "Configuration"
description: Spinnaker configuration is a multipart process, including configuring Cloud providers as deployment targets and external storage for metadata persistence.
---

There are a number of other things you can configure in your Spinnaker
installation enumerated below. At any point in time, you can
apply your configuration by deploying Spinnaker services:

```bash
kubectl kustomize -o spinnaker.yml
kubectl apply -f spinnaker.yml
```

### Deploy to more cloud accounts

[Documentation](/docs/setup/install/providers/) 

You can add as many target accounts as you want. There is nothing
preventing you from deploying to two Kubernetes clusters, one Google Compute
Engine project, and an App Engine application all at once.

### Secure your Spinnaker installation

[Documentation](/docs/setup/other_config/security/) 

You can configure SSL, setup a login page, or apply role-based authorization.~~

### Setup continuous integration

[Documentation](/docs/setup/other_config/ci/)

Configure Jenkins or Travis CI to trigger Pipelines or supply Spinnaker with
build artifacts to build into images and deploy.

### Configure notifications

[Documentation](/docs/setup/other_config/features/notifications/) 

Enable notifications to be sent on Spinnaker events, and allow external events
to trigger Pipelines in Spinnaker.

### Monitor your Spinnaker installation

[Documentation](/docs/setup/other_config/monitoring/) 

Publish timeseries data from your Spinnaker installation to a variety of
metric sources into curated dashboards. This is useful for understanding how
to scale and troubleshoot your deployment of Spinnaker.

## Next steps

Now that you know how to make configuration changes, it's worth learning how to
[Upgrade Spinnaker](/docs/setup/install/upgrades/).
