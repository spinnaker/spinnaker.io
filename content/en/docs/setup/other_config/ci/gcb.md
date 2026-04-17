---

title:  "Google Cloud Build"
description: Spinnaker supports Google Cloud Build as a continuous integration system.
---



Setting up [Google Cloud Build](https://cloud.google.com/cloud-build/) as a Continuous Integration (CI)
system within Spinnaker allows you to:
 * trigger pipelines when a GCB build completes
 * add a GCB stage to your pipeline

## Prerequisites

### GCP project

You need to have a [Google Cloud Platform](https://cloud.google.com) project with the
[Cloud Build API](http://console.cloud.google.com/apis/library/cloudbuild.googleapis.com) enabled.
You can enable the API with the following `gcloud` command:

```
gcloud services enable cloudbuild.googleapis.com
```

### Pub/sub subscription

Google Cloud Build sends [Build Notifications](https://cloud.google.com/cloud-build/docs/send-build-notifications)
when the state of your build changes.  Spinnaker subscribes to these pub/sub messages so that it can...
* track the status of builds it has initiated in a GCB stage
* trigger pipelines based on build status changes

Create a Subscription object for the `cloud-builds` topic in your project:

```
    PROJECT_ID=
    SUBSCRIPTION_NAME=spinnaker-cloud-build

    gcloud pubsub subscriptions create $SUBSCRIPTION_NAME \
      --topic projects/$PROJECT_ID/topics/cloud-builds \
      --project $PROJECT_ID
```
    

### Service account

Finally, you will need a service account that has both Cloud Build Editor and Pub/Sub Subscriber permissions.
The commands below look for the service account key in a path/file defined in `$SERVICE_ACCOUNT_KEY`.

## Configure Spinnaker to work with Google Cloud Build

### Make sure that you have locking enabled on igor
This will allow you to run multiple igor pods while NOT triggering duplicate
executions.  Make sure you have the following entry in your `igor-local.yml` file:
```
locking:
  enabled: true
```

### Enable pub/sub
Read through and enable [pub/sub integration with google](/docs/setup/other_config/triggers/google/).  This
should cover setting up google to send notifications that spinnaker will consume.


### Configure the spinnaker services
You'll want to add the following to consume GCB messages: 


#### User interface
Add the following to your deck `settings-local.js` file to enable
the UI around pub/sub.
```javascript
window.spinnakerSettings.feature.ci = true;

// add other trigger types to show as needed.
window.spinnakerSettings.triggerTypes = ["cron", "pubsub"]
```
For a more complete list of UI options, see the [deck settings file](https://github.com/spinnaker/spinnaker/blob/main/deck/packages/app/src/settings.js)

#### Event processing
In echo (the event system) add the following config to `echo-local.yml`
will enable subscriptions to events.

```yaml
gcb:
  enabled: true
  accounts:
  - name: accountName 
    project: projectID
    subscriptionName: subscriptionForGCBEvents
    jsonKey: ifNeeded
```

#### GCB invocation
In igor (the CI build handler) add the following to `igor-local.yml`
```
gcb:
  enabled: true
  accounts:
  - name: accountName
    project: projectID
    cloudBuildRegion: <optional>
    jsonKey: authCredsIfNeeded
```
You'll note that the fields are similar to echo, but missing the subscription name.   Each service
is responsible for different purposes.  Echo handles notifications FROM GCB, while igor handles requests
to INVOKE GCB builds.  Orca (the execution engine) will call igor to get a list of accounts and make
requests to GCB.

### Regional Cloud Build (Private Pools)

If you are using a [private pool](https://cloud.google.com/build/docs/private-pools/private-pools-overview) 
in a region other than `us-central1`, you need to configure the `cloudBuildRegion` for your GCB account. 
GCP uses regional endpoints for non-default private pools.

Add the regional configuration directly in your Igor profile (`~/.hal/default/profiles/igor-local.yml`):

```yaml
gcb:
  enabled: true
  accounts:
    - name: dev
      project: my-project-id
      subscriptionName: spinnaker-cloud-build
    - name: dev-us-east1
      project: my-project-id
      cloudBuildRegion: us-east1
      subscriptionName: spinnaker-cloud-build-us-east1
```

**Important:** Each regional account requires its own Pub/Sub subscription to avoid race 
conditions between accounts when processing build notifications.

## Configure your pipeline trigger

Configure your pipeline to be triggered by a completed GCB build:

1. In your Pipeline configuration, click the **Configuration** stage on the far left of the pipeline diagram.

1. Click **Automated Triggers**.

1. In the **Type** field, select `Pub/Sub`.

1. In the **Pub/Sub System Type** field, select `google`.

1. In the **Subscription Name** field, select your `$ACCOUNT_NAME` value.

1. In the **Attribute Constraints** field, enter `status` in the **Key**, and `SUCCESS` (all upper case) in the **Value** field.

1. In the **Payload Constraints** field, you can enter any of the top-level fields from the
[Build object documentation](https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/projects.builds#resource-build)
as the key, and a Java regular expression as the value.

1. In the **Expected Artifacts** field, you can add any build artifacts as expected artifacts. For example,
if the build produces a Docker image, you can add an expected artifact of type *Docker* with a value of
`gcr.io/my-project-id/my-application` (replacing `my-project-id` and `my-application` with
appropriate values). You can then [use the produced image](/docs/reference/artifacts/in-pipelines/)
in downstream stages.

## Configure a Google Cloud Build stage

To run a GCB build as part of a Spinnaker pipeline:

1. create a stage of type *Google Cloud Build*.

2. Configure the stage by selecting the GCB account to use to run the build, and entering the
[build configuration YAML](https://cloud.google.com/cloud-build/docs/build-config) in the provided text box:
![](/docs/setup/other_config/ci/gcb_config.png)
You may also provide the build definition YAML as an artifact.

3. In the *Produces Artifacts* section, you may supply any artifacts that you expect the build to create in order to
make these artifacts available to downstream stages.  Google Cloud Build supports creating either GCS or Docker image
[artifacts](https://cloud.google.com/cloud-build/docs/configuring-builds/store-images-artifacts), either of which
will be converted to Spinnaker artifacts and injected into the pipeline on completion of the build.

While your build is executing, the stage details will provide the current status of the build and a link to view
the build logs in the Google Cloud Console:
![](/docs/setup/other_config/ci/gcb_status.png)