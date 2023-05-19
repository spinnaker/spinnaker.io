---
title: "External Storage"
linkTitle: "External Storage"
weight: 40
description: >
  Spinnaker requires an external storage provider for persisting your Application settings and configured Pipelines.

---

Spinnaker require external storage for persisting your Application settings, pipelines, account data
and login information.  Because this data is sensitive and can be costly to lose, we recommend you 
use a hosted storage solution you are confident in.

Spinnaker supports SQL for most storage options.  Redis is still required even with the use
of SQL for many operations.


## Configuring SQL for the services
* [CloudDriver](/docs/setup/install/storage/clouddriver-sql/) - Required - Cache of provider data and some account tracking
* [Front50](/docs/setup/install/storage/front50-sql/) - Required - Applications, Service Permissions and Pipelines storage
* [Orca](/docs/setup/install/storage/front50-sql/) - Required - Workload and task management.  ONLY persistence is done in SQL.  Tasks still use redis.
* [Echo](/docs/setup/install/storage/echo-sql/) - Recommended - Used for CRON scheduling only.
* [Fiat](/docs/setup/install/storage/fiat-sql/) - Recommended - Permissions cache.  Defaults to redis for storage without SQL.
* [Kayenta](/docs/setup/install/storage/kayenta-sql/) - Optional - NEW, EXPERIMENTAL:  Stores metric results and canary reports in SQL.  IF Not using SQL, an object store like S3 or GCS is required to be configured.  See [Canary Config docs](/docs/setup/other_config/canary/) for more information.


## Configuring an external Redis server
* [Redis config](/docs/setup/install/storage/redis/) - Required - Cache of provider data and some account tracking

## Next steps
After you've set up your external storage service, you're ready to [deploy Spinnaker](/docs/setup/install/deploy/).
