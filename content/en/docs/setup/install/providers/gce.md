---

title:  "Google Compute Engine"
description: Spinnaker supports deploying applications to Google Compute Engine (GCE).
aliases: 
    - /setup/providers/gce/
---



In [Google Compute Engine](https://cloud.google.com/compute)
(GCE), an [Account](/docs/concepts/providers/#accounts) maps to a credential able
to authenticate against a given [Google Cloud
Platform](https://cloud.google.com/) (GCP) project.

## Prerequisites

You need a [Google Cloud Platform](https://cloud.google.com/)
(GCP) project to run Spinnaker against. The next steps assume you've already
[created a
project](https://cloud.google.com/resource-manager/docs/creating-managing-projects),
and installed [gcloud](https://cloud.google.com/sdk/downloads).
You can check that `gcloud` is installed and authenticated by running:

```bash
gcloud info
```

### Downloading credentials

Spinnaker needs a [service
account](https://cloud.google.com/compute/docs/access/service-accounts)
to authenticate as against GCE, with the role enumerated below enabled. If
you don't already have such a service account with the corresponding JSON key
downloaded, you can run the following commands to do so:

```bash
SERVICE_ACCOUNT_NAME=spinnaker-gce-account
SERVICE_ACCOUNT_DEST=~/.gcp/gce-account.json

gcloud iam service-accounts create \
    $SERVICE_ACCOUNT_NAME \
    --display-name $SERVICE_ACCOUNT_NAME

SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:$SERVICE_ACCOUNT_NAME" \
    --format='value(email)')

PROJECT=$(gcloud config get-value project)

# permission to create/modify instances in your project
gcloud projects add-iam-policy-binding $PROJECT \
    --member serviceAccount:$SA_EMAIL \
    --role roles/compute.instanceAdmin

# permission to create/modify network settings in your project
gcloud projects add-iam-policy-binding $PROJECT \
    --member serviceAccount:$SA_EMAIL \
    --role roles/compute.networkAdmin

# permission to create/modify firewall rules in your project
gcloud projects add-iam-policy-binding $PROJECT \
    --member serviceAccount:$SA_EMAIL \
    --role roles/compute.securityAdmin

# permission to create/modify images & disks in your project
gcloud projects add-iam-policy-binding $PROJECT \
    --member serviceAccount:$SA_EMAIL \
    --role roles/compute.storageAdmin

# permission to download service account keys in your project
# this is needed by packer to bake GCE images remotely
gcloud projects add-iam-policy-binding $PROJECT \
    --member serviceAccount:$SA_EMAIL \
    --role roles/iam.serviceAccountActor

mkdir -p $(dirname $SERVICE_ACCOUNT_DEST)

gcloud iam service-accounts keys create $SERVICE_ACCOUNT_DEST \
    --iam-account $SA_EMAIL
```

Once you have run these commands, your GCP JSON key is sitting in a file
called `$SERVICE_ACCOUNT_DEST`.

## Adding an Account



1. Get the following values (we've provided defaults for you):

```bash
PROJECT=$(gcloud config get-value project)
SERVICE_ACCOUNT_DEST=# see Prerequisites section above
```

2. Add your new google account and enable google:

```yaml
google:
  enabled: true
  accounts:
    - name: account-name
      project: replaceMe
      jsonPath: /mnt/configmap/file.json
```

## Advanced account settings
More account configuration properties can be found [in the codebase for the google account](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-google-common/src/main/groovy/com/netflix/spinnaker/clouddriver/googlecommon/config/GoogleCommonManagedAccount.groovy#L22).
This code is actually extended with MORE options here: https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-google/src/main/groovy/com/netflix/spinnaker/clouddriver/google/config/GoogleConfigurationProperties.groovy#L44

It's recommended with large numbers of accounts to disable verification and check logs
for account access healthy by setting:
```yaml
google:
  health:
    verifyAccountHealth: false
```

## Next steps
Optionally, you can [set up another cloud provider](/docs/setup/install/providers/) or
continue the [installation instructions](/docs/setup/install/)
