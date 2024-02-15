---
title: Triggering pipelines with Bitbucket Server
linkTitle: Bitbucket
description: >
  Trigger Spinnaker pipelines based on Bitbucket Server webhook events.
---

## Overview of supported Bitbucket Server events

Spinnaker supports the following Bitbucket Server webhook events:

* Declined (pr:declined)
* Deleted (pr:deleted)
* Merged (pr:merged)
* Modified/Source branch updated (pr:from_ref_updated)
* Opened (pr:opened)
* Push (repo:refs_changed)


## Before you begin

* You are familiar with [creating and triggering webhooks](https://confluence.atlassian.com/bitbucketserver/manage-webhooks-938025878.html) in Bitbucket Server.
* You have configured [Bitbucket notifications (webhooks)]({{< ref "docs/setup/other_config/features/notifications/index.md#bitbucket-cloud" >}}) in Spinnaker and enabled the desired webhook events in your Bitbucket repository.

## Add a Bitbucket webhook event as a pipeline trigger

1. In your pipeline, go to **Configuration** > **Automated Triggers**.
1. Configure a new trigger with the following information:

   * **Type**: `Git`
   * **Repo Type**: `bitbucket`
   * **Team or User**: enter your Bitbucket team or user name
   * **Repo name**: enter your Bitbucket repo name
   * **Branch**: enter your branch name (optional)
   * **Artifact Constraints**: select a constraint (optional)
   * **Trigger Enabled**: select the box

## Troubleshooting

Check the Echo log for webhook activity.
