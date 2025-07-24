---
title:  "Google Cloud Run"
description: Spinnaker supports deploying applications to Google Cloud Run.
aliases: 
    - /setup/providers/cloudrun/
---



In [Google Cloud Run](https://cloud.google.com/run), an
[Account](/docs/concepts/providers/#accounts) maps to a credential able to
authenticate against a given [Google Cloud
Platform](https://cloud.google.com) project.

## Prerequisites

You need a [Google Cloud Platform](https://cloud.google.com/)
project to run Spinnaker against. The next steps assume you've already [created
a project](https://cloud.google.com/resource-manager/docs/creating-managing-projects),
and installed [gcloud](https://cloud.google.com/sdk/downloads).
You can check that `gcloud` is installed and authenticated by running:

```bash
gcloud info
```

To initialize the gcloud CLI, run the following command:

```bash
gcloud init
```

If this is your first time deploying to Cloud Run in your project, create a Cloud Run application.

To set the default project for your Cloud Run service:

```bash
gcloud config set project <PROJECT_ID>
```

> NOTE: Replace PROJECT_ID with the name of the project you created.


Enable the Cloud Run Admin API:

```bash
gcloud services enable run.googleapis.com
```

For Cloud Build to be able to build your sources, grant the Cloud Build Service Account role to the Compute Engine default service account by running the following:

```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
    --member=serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com \
    --role=roles/cloudbuild.builds.builder
```

> NOTE: Replace PROJECT_NUMBER with your Google Cloud project number, and PROJECT_ID with your Google Cloud project ID.


## Downloading credentials

Spinnaker does not need to be given [service account](https://cloud.google.com/compute/docs/access/service-accounts)
credentials if it is running on a Google Compute Engine VM whose
application default credentials have sufficient scopes to deploy to Cloud Run _and_
Spinnaker is deploying to an Cloud Run application inside the same Google Cloud Platform project in which it is running. If
Spinnaker does not need to be given service account credentials, or if you already have such a service account
with the corresponding JSON key downloaded, skip ahead to [Adding an Account](#adding-an-account).

Run the following commands to create a service account
with the `roles/run.admin` and `roles/storage.admin` roles enabled:

```bash
SERVICE_ACCOUNT_NAME=spinnaker-cloudrun-account
SERVICE_ACCOUNT_DEST=~/.gcp/cloudrun-account.json

gcloud iam service-accounts create \
    $SERVICE_ACCOUNT_NAME \
    --display-name $SERVICE_ACCOUNT_NAME

SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:$SERVICE_ACCOUNT_NAME" \
    --format='value(email)')

PROJECT=$(gcloud config get-value project)

gcloud projects add-iam-policy-binding $PROJECT \
    --role roles/storage.admin \
    --member serviceAccount:$SA_EMAIL

gcloud projects add-iam-policy-binding $PROJECT \
    --role roles/run.admin \
    --member serviceAccount:$SA_EMAIL

mkdir -p $(dirname $SERVICE_ACCOUNT_DEST)

gcloud iam service-accounts keys create $SERVICE_ACCOUNT_DEST \
    --iam-account $SA_EMAIL
```

Your service account JSON key now sits inside `$SERVICE_ACCOUNT_DEST`.

## Adding an account

First, make sure that the provider is enabled:

```bash
hal config provider cloudrun enable
```

Next, run the following `hal` command to add an account named `my-cloudrun-account` to your list of Cloud Run accounts:

```bash
hal config provider cloudrun account add my-cloudrun-account \
  --project $PROJECT \
  --json-path $SERVICE_ACCOUNT_DEST
```

You can omit the `--json-path` flag if Spinnaker does not need service account credentials.

## Deploying to Cloud Run

### Deploying from Git

Spinnaker supports deploying your source code to Cloud Run by cloning your application's git
repository and submitting it to Cloud Run. Unless your code is public, Spinnaker needs a mechanism to
authenticate with your repositories - many of the configuration flags for Cloud Run manage this
authentication.

You can view the available configuration flags for Cloud Run within the
[Halyard reference](/docs/reference/halyard/commands#hal-config-provider-cloudrun-account-add).

### Deploying from storage

Much like deploying from Git, Spinnaker also supports deploying your source code to Cloud Run
from a Google Cloud Storage bucket.  This method of deploying requires you to bundle your code
into a .tar archive and then store that on GCS.  When the deploy stage executes, Spinnaker will
fetch your tar archive, untar it, and then deploy the code to Cloud Run.

### Deploying from Google Container Registry URL

Spinnaker supports deploying Docker containers on the Cloud Run runtime from images built and stored
in Google Container Registry from just a gcr.io URL.

You'll find an option in the Create Server Group dialog in Deck to use a **Container Image** as a
deployment's **Source Type**. Selecting the **Container Image** option reveals a textbox that can then be used to specify the gcr.io URL.  Alternatively
you can use an **Artifact** as the source of the container image URL.

## Next steps

Optionally, you can [set up another cloud provider](/docs/setup/install/providers/),
but otherwise you're ready to [choose an environment](/docs/setup/install/environment/)
in which to install Spinnaker.
