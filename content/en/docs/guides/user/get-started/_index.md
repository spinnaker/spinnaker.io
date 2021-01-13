---
title: "Get Started Using Spinnaker"
linkTitle: "Get Started"
weight: 1
description: >
  Get started using Spinnaker
---

> This article assumes you are new to Spinnaker. It contains basic information
> about what to do after [Spinnaker is installed](/docs/setup/install/).

## Before you get going...

Whether you're an operator or admin installing or managing Spinnaker or an
end user getting started using Spinnaker, here are some pointers to get you
started.

### Operators (managing Spinnaker)

* If you want to install Spinnaker, [see the instructions here](/docs/setup/install/).

* If you want to find out more about tuning and maintaining Spinnaker, here are
some things to check out:

  - [Advanced configuration](/docs/setup/other_config/)
  - [Productionize Spinnaker](/docs/etup/productionize/)

### Users (deploying with Spinnaker)

* If you want to try out Spinnaker, here are some
[quickstarts](/docs/setup/quickstart/).

* If Spinnaker is already installed in your organization, and you want to practice it
using some guided tutorials, [here are 
codelabs](/docs/guides/tutorials/codelabs/).

* If you want a basic overview of how to use Spinnaker, the high-level
process is described below.

## Using Spinnaker: the high-level process

1. [Create an application](/docs/guides/user/applications/)

   Typically, you'll have one application per microservice.

   > **Note**: Your application configuration affects what you can do with
   Spinnaker&mdash;you can enable or disable some Spinnaker features.

1. Define the [infrastructure](/docs/concepts/) the service will run on

   You define infrastructure for each application. Your pipelines deploy
   services to the server groups you define.

   > **Note**: This step is not a prerequisite for creating pipelines. In fact, you
   > can use pipelines to create infrastructure.

1. [Create a pipeline](/docs/guides/user/pipeline/managing-pipelines/)

   Create all the pipelines you need to deploy the service or services
   covered by the application, in whatever ways you want to deploy.

   Learn more in the [Managing pipelines
   guide](/docs/guides/user/pipeline/managing-pipelines/).  

2. [Run your pipeline](/docs/guides/user/pipeline/triggers/) to deploy your service

   You can run a pipeline manually, but most pipelines are [triggered
   automatically](/docs/guides/user/pipeline/triggers/).

3. For practice, and to see some sample deployment scenarios, check out our
[codelabs](/docs/guides/tutorials/codelabs/).

<!--
## The advanced stuff

When you can create and run pipelines, you've got the basics down, but there's a
lot more you can do with Spinnaker.

* [Configure and execute automated canary analysis](/docs/guides/user/canary/)
for your deployments

* [Choose a deployment strategy](/concepts/#deployment-strategies)

* Get to know the [`spin` command-line interface](/docs/guides/spin/cli/)
-->
