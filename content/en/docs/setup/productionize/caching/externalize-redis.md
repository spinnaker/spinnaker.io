---

title:  "Externalize Redis"
sidebar:
  nav: setup
aliases: 
  - /setup/scaling/externalize-redis/
---

One of the easiest ways to improve Spinnaker's reliability at scale is to use an
external Redis. The default redis component isn't configured to be production-ready.
If you have a hosted Redis alternative, or a database team managing a Redis 
installation, we highly recommend using that.

## Configure a Spinnaker-wide Redis

First, determine the URL of your Redis installation. Some examples include:

* `redis://some.redis.url:6379`: Redis running at `some.redis.url` on port
  `6379`.

* `redis://admin:passw0rd@some.redis.url:6379`: Same as above, but with
  a username/password pair.

* `redis://admin:passw0rd@some.redis.url:6379/1`: Same as above, but using
  database 1. See [SELECT documentation](https://redis.io/commands/select).

We will refer to this as `$REDIS_ENDPOINT`.  You can add this to a common configuration
for all services `~/spinnaker-kustomize/base/spinnaker.yml`

```yaml
services:
  redis:
    baseUrl: redis://some.redis.url:6379
    enabled: true
    host: 0.0.0.0
    port: 6379
```

## Configure per-service Redis

If your single Redis node is overloaded (unlikely - spinnaker mostly uses SQL at this point), 
you can configure Spinnaker's services to use different Redis endpoints. You can adjust
the redis baseUrl in each service with an overridden configuration like so:

```yaml
services.redis.baseUrl: $REDIS_ENDPOINT
```

## Using a hosted Redis

Gate requires keyspace notifications to be enabled in Redis, and tries to configure
this when it starts up. Some hosted Redis services disable the `CONFIG` command, blocking
Gate from modifying the configuration. In this case:
1. Manually set the configuration parameter `notify-keyspace-events` to `gxE` on your Redis
instance by following the documentation provided by your hosted Redis provider.
2. Disable automatic Redis configuration in Gate by adding the following to your
`gate-local.yml` file:
```yaml
  redis:
    configuration:
      secure: true
```