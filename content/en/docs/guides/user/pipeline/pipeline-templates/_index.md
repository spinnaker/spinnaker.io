---
title: "Using Pipeline Templates"
linkTitle: "Using Pipeline Templates"
weight: 15
description: >
  Standardize and distribute reusable pipelines across your team or among multiple teams.
---

You can share these templates with your teams within a single application,
across different applications, or even across different deployments of
Spinnaker itself.

Templates can be managed using [spin](/docs/guides/spin/pipeline-templates/) or the UI. To manage templates through the UI, enable the requisite feature flag: `hal config features edit --managed-pipeline-templates-v2-ui true`

**Before you begin:**

* [Install the Spin CLI]({{< ref "/docs/setup/other_config/spin/index" >}}) so you can manage pipelines and pipeline templates.
* [Enable pipelines templates]({{< ref "/docs/guides/user/pipeline/pipeline-templates/enable" >}}).

## Structure of a pipeline template

[The underlying structure](/docs/reference/pipeline/templates/) of a pipeline template is very close to the pipeline
JSON configuration format, viewable in the Deck UI. But it includes information
about the variables the template uses.

## The things you can do with pipeline templates

* [Create a template]({{< ref "/docs/guides/user/pipeline/pipeline-templates/create" >}}) based on an existing pipeline.

* Share the template with one or more teams of developers using Spinnaker.

  [Save a pipeline template]({{< ref "/docs/guides/user/pipeline/pipeline-templates/create#4-save-the-template" >}}) to Spinnaker to make it available to developers.

* [Use the Spin CLI to plan how to parameterize the
template]({< ref "/docs/guides/user/pipeline/pipeline-templates/plan" >}}) by visualizing a hydrated pipeline.

* [Create a pipeline based on a template]({{< ref "/docs/guides/user/pipeline/pipeline-templates/instantiate" >}}).

* [Override]({{< ref "/docs/guides/user/pipeline/pipeline-templates/override" >}}) template definitions in your pipeline.

* [List and get pipeline templates]({{< ref "/docs/guides/spin/pipeline-templates" >}}).
