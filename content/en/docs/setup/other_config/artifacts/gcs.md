---

title:  "Configuring GCS Artifact Credentials"
description: Spinnaker supports using GCS objects as artifacts.
---

Spinnaker stages that read data from artifacts can consume
[GCS](https://cloud.google.com/storage/) objects as artifacts.

## Prerequisites

You need a [Google Cloud Platform](https://cloud.google.com/)
(GCP) project to host a bucket in. The next steps assume you've already [created a
project](https://cloud.google.com/resource-manager/docs/creating-managing-projects),
and installed [`gcloud`](https://cloud.google.com/sdk/downloads).
You can check that `gcloud` is installed and authenticated by running:

```bash
gcloud info
```

### Download credentials

Spinnaker needs a [service
account](https://cloud.google.com/compute/docs/access/service-accounts)
to authenticate as against GCP, with the `roles/storage.admin` role enabled. If
you don't already have such a service account with the corresponding JSON key
downloaded, you can run the following commands to do so:

```bash
SERVICE_ACCOUNT_NAME=spin-gcs-artifacts-account
SERVICE_ACCOUNT_DEST=~/.gcp/gcs-artifacts-account.json

gcloud iam service-accounts create \
    $SERVICE_ACCOUNT_NAME \
    --display-name $SERVICE_ACCOUNT_NAME

SA_EMAIL=$(gcloud iam service-accounts list \
    --filter="displayName:$SERVICE_ACCOUNT_NAME" \
    --format='value(email)')

PROJECT=$(gcloud config get-value project)

gcloud projects add-iam-policy-binding $PROJECT \
    --role roles/storage.admin --member serviceAccount:$SA_EMAIL

mkdir -p $(dirname $SERVICE_ACCOUNT_DEST)

gcloud iam service-accounts keys create $SERVICE_ACCOUNT_DEST \
    --iam-account $SA_EMAIL
```

Once you have run these commands, your GCS JSON key is sitting in a file
called `$SERVICE_ACCOUNT_DEST`.

## Add the account and enable it

Add the credentials either to a [secrets manager](https://spinnaker.io/docs/reference/secrets/)
for use by reference or to a volume mounted into the clouddriver pods by modifying the deployment.yaml for clouddriver.

Next, enable gcs artifacts and add an artifact account to `clouddriver-local.yml`:

```yaml
artifacts:
  enabled: true
  gcs:
    enabled: true
    accounts:
      - name: my-gcs-artifact-account
        ## This can be a secret reference
        json-path: /mnt/secrets/service-account-file.json
```

Last, redeploy clouddriver with these changes