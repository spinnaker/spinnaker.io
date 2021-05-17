---

title:  "Redis"
description: Spinnaker supports using Azure for persisting your Application settings and configured Pipelines.
aliases: 
   - /setup/storage/redis/
---

> We _highly_ recommend relying on [Minio](/docs/setup/install/storage/minio) instead of Redis if you are looking for a local persistant storage solution for Spinnaker. The Redis storage implementation is untested and unsupported by anyone in the Spinnaker community."

> Redis can be used as Spinnaker's persistent storage source, but it is unsupported and __not__ recommended for production use-cases because it mixes fungible, short-lived cache entries with the Pipeline and Application data that deploy all of your infrastructure. This means you will have to be extra careful when clearing your Spinnaker Redis cache.


## Prerequisites

Currently, Halyard only allows you to use the Redis instance that Halyard
provisions/installs on your behalf. While this is likely to change, for you
don't need to preconfigure anything to get this storage source working.


## Editing your storage settings

All that's needed is the following command:

```
hal config storage edit --type redis
```

## Next steps

After you've set up Redis as your external storage service, you're ready to
[deploy Spinnaker](/docs/setup/install/deploy/).
