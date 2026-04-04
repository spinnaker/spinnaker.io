---

title:  "Deploy Spinnaker and Connect to the UI"
description: After you finish configuring Spinnaker, deploy it and connect to the Deck, the Spinnaker UI.
weight: 50
---

Now that we've enabled one or more [Cloud Providers](/docs/setup/install/providers/), picked a [Deployment Environment](/docs/setup/install/environment/), and configured
[Persistent Storage](/docs/setup/install/storage/), we're ready to pick a version of Spinnaker, deploy it, and connect to it.

## Pick a version

1. See the available versions on the [versions page](https://spinnaker.io/docs/releases/versions/)

   You can follow the links to the versions' respective changelogs to see what
   features each adds.

1. Set the version you want to use:
Set this on the [kustomize image tag configuration](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/kustomization.yml#L12C15-L12C16).  All spinnaker versions since
the monorepo use the same image tags, e.g. 2025.3.2.  

## Deploy Spinnaker

```bash
kubectl kustomize -o ./spinnaker.yaml
kubectl apply -f ./spinnaker.yaml

```

## Create an ingress

## Connect to the Spinnaker UI

## Troubleshooting
First, check that services are running.  IF a service isn't running, check the logs
for configuration errors.  

Next once all services are running, make sure you can talk to the gate endpoint.  You
should be able to check the health endpoint even externally via the gate-api/health endpoint.

## Upgrade Spinnaker

To upgrade, read the release notes and change the images to the newer versions.  Adjust
any config that's been removed/changed as needed.  

## Next steps

Now that Spinnaker is deployed and capable managing your cloud provider, you
can...

* Continue with additional configuration, such as your [image bakery](/docs/setup/other_config/bakery/)

* If you're a Spinnaker end user, read how to [get started using Spinnaker](/docs/guides/user/get-started)

* Visit the [Guides](/docs/guides/) pages to learn more

Remember to keep your configuration in git for both history and changes!
