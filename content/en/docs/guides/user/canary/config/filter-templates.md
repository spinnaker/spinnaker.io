---
title: "Create and use filter templates"
linkTitle: "Filter templates"
weight: 2
description: >
  Filter templates allow you to create advanced queries against your telemetry provider.
aliases:
  - /user/canary/config/filter_templates/
---

Filter templates allow you to compose and parameterize advanced queries against
your telemetry provider. Parameterized queries are hydrated by values provided
in the [canary stage](/docs/guides/user/canary/stage/#extended-params).

## Things to keep in mind

* Each filter template you create for a given canary configuration is available
to each individual metric you add.

* The query against your metrics is the metric type _plus_ selectors that refine
what is returned in the time series.

   For Spinnaker canary purposes, the filter template contains only those
   refining selectors. The metric type is provided by the list of metrics above.

* The purpose of the metric filter is to allow you to parameterize what
is in these refining selectors, but it is perfectly legal to use literal
values in filter templates.

## Create a filter template

1. In the [canary configuration](/docs/guides/user/canary/config/), find the __Filter
Templates__ section, and click __Add Template__.

1. Provide a name.

   This name is then populated in the __Configure Metric__ dialog for each
   individual metric in this config.

   ![Simple query template](/docs/guides/user/canary/config/configure_metric_dialog.png)

1. In the __Template__ field, enter the filter.

   ![Simple query template](/docs/guides/user/canary/config/a_filter_template.png)

## Apply filter templates to metrics

1. For any metric in this configuration, click the edit icon.

1. Click the __Filter Template__ field, and select the template you want to
apply to time series using this metric.

## Provide runtime values for parameterized filters

1. In the [canary stage config](/docs/guides/user/canary/stage/), under __Extended
Params__, click __Add Field__.

   This will create a value for one parameter.

2. Under __Key__, type a variable you used in a filter template in the config
this stage is using.

3. Add the value you want for that variable. You can use any literal or
   [pipeline expression](/docs/guides/user/pipeline/expressions/).

![](/docs/guides/user/canary/config/extended_params.png)
