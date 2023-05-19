---

title:  "Externalize Redis"
sidebar:
  nav: setup
aliases: 
  - /setup/scaling/externalize-redis/
---

One of the easiest ways to improve Spinnaker's reliability at scale is to use an
external Redis. The Redis installed by Spinnaker (either locally, or in
Kubernetes) isn't configured to be production-ready. If you have a hosted Redis
alternative, or a database team managing a Redis installation, we highly
recommend using that.

## Configure a Spinnaker-wide Redis

First, determine the URL of your Redis installation. Some examples include:

* `redis://some.redis.url:6379`: Redis running at `some.redis.url` on port
  `6379`.

* `redis://admin:passw0rd@some.redis.url:6379`: Same as above, but with
  a username/password pair.

* `redis://admin:passw0rd@some.redis.url:6379/1`: Same as above, but using
  database 1. See [SELECT documentation](https://redis.io/commands/select).

* `rediss://some.redis.url:6379`: Using Encryption

We will refer to this as `$REDIS_ENDPOINT`.

Using Halyard's [custom configuration](/docs/reference/halyard/custom#custom-service-settings)
we will create the following file `~/.hal/$DEPLOYMENT/service-settings/redis.yml`:

```yaml
overrideBaseUrl: $REDIS_ENDPOINT
skipLifeCycleManagement: true
```

> __note__: by setting `skiplifecyclemanagement` we are telling halyard to stop
> deploying/check the status of the redis instance. if halyard has already
> created a redis instance, you will have to manually delete it.

## Configuration requirements

Gate (the spinnaker front end API) requires keyspace notifications to be enabled in Redis, and tries to configure
this when it starts up. Some hosted Redis services disable the `CONFIG` command, blocking
Gate from modifying the configuration. In this case:
1. Manually set the configuration parameter `notify-keyspace-events` to `gxE` on your Redis
   instance by following the documentation provided by your hosted Redis provider.
2.  Create the following file in order to customize the gate service. `~/.hal/default/profiles/gate-local.yml`:
```yaml
redis:
    configuration:
         secure:
              true
```

## Verify config

You can confirm that this works by doing the following:

1. Run `hal config generate`
2. Check that the contents of `~/.hal/default/staging/spinnaker.yml` under the `services.redis.baseUrl:` section
matches `$REDIS_ENDPOINT`
3. (Optional) deploy your changes with `hal deploy apply`
