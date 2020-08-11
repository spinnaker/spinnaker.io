---
title: "Cloud Providers Overview"
linkTitle: "Cloud Providers"
weight: 2
description: >
  Supported providers
---


In Spinnaker, *Providers* are integrations to the Cloud platforms you deploy
your applications to.

In this section, you'll register credentials for your Cloud platforms. Those
credentials are known as *Accounts* in Spinnaker, and Spinnaker deploys your
applications via those accounts.

## Supported providers

All of Spinnaker's abstractions and capabilities are built on top of the [Cloud
Providers](/concepts/providers/) that it supports. So, for Spinnaker to do
anything you must enable at least one provider, with one Account added for it.

Add as many of the following providers as you need. When you're done, return to this page.

* [App Engine](/docs/v1.19/setup/install/providers/appengine/)
* [Amazon Web Services](/docs/v1.19/setup/install/providers/aws/)
* [Azure](/docs/v1.19/setup/install/providers/azure/)
* [Cloud Foundry](/docs/v1.19/setup/install/providers/cf/)
* [DC/OS](/docs/v1.19/setup/install/providers/dcos/)
* [Google Compute Engine](/docs/v1.19/setup/install/providers/gce/)
* [Kubernetes](/docs/v1.19/setup/install/providers/kubernetes-v2/)
* [Oracle](/docs/v1.19/setup/install/providers/oracle/)

See also [`hal config provider`](/reference/halyard/commands/#hal-config-provider)
for command reference documentation.

## Next steps

When you've finished setting up your cloud provider, you're ready to
[choose an environment](/docs/v1.19/setup/install/environment/).