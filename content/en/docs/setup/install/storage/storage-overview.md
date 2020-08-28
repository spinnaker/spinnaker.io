---
title: "External Storage Overview"
weight: 1
description: >
  Spinnaker requires an external storage provider for persisting your Application settings and configured Pipelines.
---

Spinnaker requires an external storage provider for persisting your Application
settings and configured Pipelines. Because these data are sensitive and can be
costly to lose, we recommend you use a hosted storage solution you are confident
in.

Spinnaker supports the storage providers listed below. Whichever option you
choose does not affect your choice of [Cloud Provider](/docs/v1.19/setup/providers/).
That is, you can use [Google Cloud
Storage](https://cloud.google.com/storage/) as a storage
source but still deploy to [Microsoft Azure](https://azure.microsoft.com/).

## Supported storage solutions

Set up persistent storage for your Spinnaker instance by choosing one of the options below. When you've
completed the section, return to this page.

* [Azure Storage](/docs/v1.19/setup/install/storage/azs)
* [Google Cloud Storage](/docs/v1.19/setup/install/storage/gcs)
* [Minio](/docs/v1.19/setup/install/storage/minio)
* [Redis](/docs/v1.19/setup/install/storage/redis) :warning: Unsupported and not recommended for production environments
* [S3](/docs/v1.19/setup/install/storage/s3)
* [Oracle Object Storage](/docs/v1.19/setup/install/storage/oracle)


See also [`hal config storage`](/reference/halyard/commands/#hal-config-storage).

## Next steps

After you've set up your external storage service, you're ready to [deploy Spinnaker](/docs/v1.19/setup/install/deploy/).