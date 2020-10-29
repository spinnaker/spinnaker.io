---
title: "Triggering pipelines with Jenkins"
linkTitle: "Jenkins"
weight:
description: >
  Add a [Jenkins](https://jenkins.io/) trigger to your pipeline.
---


## Prerequisites

* [Set up Jenkins](/docs/setup/ci/jenkins/) as a continuous integration system in
    your Spinnaker deployment.
* Enable [artifact support](/docs/reference/artifacts-with-artifactsrewrite//#enabling-artifact-support).  

## Adding a Jenkins trigger

1.  [Create a pipeline](/docs/guides/user/pipeline/managing-pipelines/#create-a-pipeline).
1.  In the **Configuration** stage of your new pipeline,
    [add a trigger](/docs/guides/user/pipeline/managing-pipelines/#add-a-trigger).
1.  Select **Jenkins** from the **Type** menu, which brings up the following
    screen:

    ![](add-trigger.png)

1.  Select a Jenkins master from the **Master** drop-down menu, then select a job from
    the **Job** drop-down.
1.  Add a property file, if desired. See the [property
    files](/docs/guides/user/pipeline/expressions/#property-files) section of the
    Pipeline Expression Guide for more information about how to specify and use
    property files.
