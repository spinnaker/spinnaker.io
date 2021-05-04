---
title: "CI Features"
---

One of the goals of Managed Delivery is to show you the journey of your code, from commit to deployment,
in an easy, consistent way.
In order to enable this experience, we created an integration between Managed Delivery and the Continuous Integration (CI) provider, which is described below.

> Note: in order to take advantage of this feature, your Spinnaker operator/administrator will have to configure a CI provider which matches your company's setup. 
They can look for available open-source or commercial Spinnaker CI providers, or even develop their own. See the developer guide on [CI integration]({{< ref "integrate-your-ci" >}}).

## Artifact metadata

Detailed metadata (like commit message, author, timestamp) is visible in the Environments view in the UI, by clicking on an artifact version.

Here's what it looks like in the UI:
{{< figure src="artifact-metadata.png" >}}


## See code changes between deployments

Now that we have git metadata for each artifact, we can easily figure out the code differences between each version.
We added the `See changes` button in the UI, for each environment, which looks like this:
{{< figure src="see-changes.png" >}}

In Slack notifications:
{{< figure src="slack-see-changes.png" >}}


## Surface build information in the UI
{{< figure src="build-info.png" >}}

A new section called "Pre-deployment" is now available in the UI. This section will surface pre-deployment steps like baking (for Debian packages only) or building.
By clicking on "See details", you'll be taken to the viewing CI details (see below), or a CI job log which can be provided as a part of the CI integration.

## Viewing CI details in Spinnaker

We recently added the option to see CI details in Spinnaker, in a new "Builds" tab.
It looks like this:
{{< figure src="ci-view.png" >}}

This is a new tab that can be accessed from the main Spinnaker UI.
