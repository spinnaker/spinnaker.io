---
title: 'High Availability'
mermaid: true
description:
---

## Warning this is an advanced that most basic users never need to worry about

This page describes how you can configure a Spinnaker deployment to increase the availability/performance
of specific services beyond simply [horizontally scaling](/docs/setup/productionize/scaling/horizontal-scaling/) the services.

This is done by splitting the functionalities of a service into separate logical roles. The benefits of
doing this is specific to the service that is being sharded. These deployment strategies are inspired
by [Netflix's large scale experience](https://blog.spinnaker.io/scaling-spinnaker-at-netflix-part-1-8a5ae51ee6de).

When sharded, the new logical services are given new names. This means that these logical services can be configured and scaled independently of each other.

Currently, this feature is primarily for Clouddriver and/or Orca.  Echo can do some sharding as well.

## HA Clouddriver

{{< mermaid >}}
graph TB

clouddriver(Clouddriver) --> clouddriver-caching(Clouddriver-Caching);
clouddriver --> clouddriver-rw(Clouddriver-RW);
clouddriver --> clouddriver-ro(Clouddriver-RO);
clouddriver --> clouddriver-ro-deck(Clouddriver-RO-Deck)

classDef default fill:#d8e8ec,stroke:#39546a;
linkStyle default stroke:#39546a,stroke-width:1px,fill:none;

classDef split fill:#42f4c2,stroke:#39546a;
class clouddriver-caching,clouddriver-ro,clouddriver-ro-deck,clouddriver-rw,echo-scheduler,echo-worker split
{{< /mermaid >}}

Clouddriver benefits greatly from isolating its operations into separate services. To split Clouddriver into
multiple services, you'll configure each service to operate on specific configurations and operations.
* Caching pods - for JUST executing cache agents.  These will not process any user or pipeline execution data
* RW pods - for execution operations
* RO pods - for UI and API operations for end users.

For more advanced configurations INCLUDING sharding clouddriver by account, region or application names, you can
look at the code in clouddriver, orca, and gate around ServiceSelectors.  We'd welcome additional documentations
for this as needed.

Although by default the four Clouddriver services will communicate with a global Redis and Database (all Spinnaker services speak
to this Redis/SQL), it is recommended that the logical Clouddriver services be configured to communicate
with external solutions. To be most effective, `clouddriver-ro` should be configured to speak to a RO SQL read
replica, `clouddriver-ro-deck` should be configured to speak to a different read replica, and the other two should
be configured to speak to the master. 

For example configurations, please look into clouddrivers codebase, the [SQL configuration](/docs/setup/install/storage/) 

More information on Redis replication can be [found here](https://redis.io/topics/replication).

### `clouddriver-caching`

The first of the four logical Clouddriver services is the `clouddriver-caching` service. This service caches and retrieves cloud infrastructure data. Since this is all that `clouddriver-caching` is doing, there is no communication between this service and any other Spinnaker service.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-clouddriver-caching`.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `clouddriver-caching`.

### `clouddriver-rw`

The second logical Clouddriver service is the `clouddriver-rw` service. This service handles all mutating operations aside from what the `clouddriver-caching` service does. This service can be scaled to handle an increased number of writes.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-clouddriver-rw`.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `clouddriver-rw`.

### `clouddriver-ro`

The `clouddriver-ro` service handles all read requests to Clouddriver. This service can be scaled to handle an increased number of reads.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-clouddriver-ro`.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `clouddriver-ro`.

### `clouddriver-ro-deck`

The `clouddriver-ro-deck` service handles all read requests to Clouddriver from Deck (through Gate). This service can be scaled to handle an increased number of reads.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-clouddriver-ro-deck`.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `clouddriver-ro-deck`.

## HA Echo

{{< mermaid >}}
graph TB

echo(Echo) --> echo-scheduler(Echo-Scheduler);
echo(Echo) --> echo-worker(Echo-Worker);

classDef default fill:#d8e8ec,stroke:#39546a;
linkStyle default stroke:#39546a,stroke-width:1px,fill:none;

classDef split fill:#42f4c2,stroke:#39546a;
class clouddriver-caching,clouddriver-ro,clouddriver-rw,echo-scheduler,echo-worker split

{{< /mermaid >}}

Echo can be split into two separate services that handle different operations. To split Echo for increased availability, run:

```bash
hal config deploy ha echo enable
```

When Spinnaker is deployed with this enabled, Echo will be deploy as two different services:

- [`echo-scheduler`](#echo-scheduler)
- [`echo-worker`](#echo-worker)

Although only the `echo-worker` service can be horizontally scaled, splitting the services will reduce the load on both.

### `echo-scheduler`

The `echo-scheduler` service handles scheduled tasks, or cron-jobs. Since it performs its tasks periodically (no triggers) there is no need for communication with other Spinnaker services.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-echo-scheduler`. To avoid duplicate triggering, this service must be deployed with exactly one pod.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `echo-scheduler`.

### `echo-worker`

The `echo-worker` service handles all operations of Echo besides the cron-jobs.

This service's name when [configuring its sizing](/docs/reference/halyard/component-sizing/) is `spin-echo-worker`. This service can be scaled to more than one pod, unlike the `echo-scheduler`.

To add a [custom profile](/docs/reference/halyard/custom/#custom-profiles) or [custom service settings](/docs/reference/halyard/custom/#custom-service-settings) for this service, use the name `echo-worker`.

## Deleting Orphaned Services

When enabling or disabling HA for a service on a running Spinnaker, Halyard will not clean up the old service(s) by default. This means that if a non-HA Clouddriver is running (for example) and Spinnaker is then deployed with HA Clouddriver enabled, the non-HA Clouddriver will still be running, even though it is no longer used. To clean up these orphaned services, add a `--delete-orphaned-services` flag to `hal deploy apply`:

```bash
hal deploy apply --delete-orphaned-services
```

## HA Topology

With all services enabled for high availability, the new architecture looks like this:

{{< mermaid >}}
graph TB

deck(Deck) --> gate;
api(Custom Script/API Caller) --> gate(Gate);
gate --> kayenta(Kayenta);
gate --> orca(Orca);
gate --> clouddriver-ro(Clouddriver-RO);
gate --> clouddriver-ro-deck(Clouddriver-RO-Deck)
orca --> clouddriver-rw(Clouddriver-RW);
gate --> rosco(Rosco);
orca --> front50;
orca --> rosco;
gate --> front50(Front50);
gate --> fiat(Fiat);
orca --> kayenta;
clouddriver-ro --> fiat;
clouddriver-ro-deck --> fiat;
clouddriver-rw --> fiat;
orca --> fiat;
front50 --> fiat;
echo-worker(Echo-Worker) --> orca;
echo-worker --> front50;
igor(Igor) --> echo-worker;
clouddriver-caching(Clouddriver-Caching);
echo-scheduler(Echo-Scheduler);

classDef default fill:#d8e8ec,stroke:#39546a;
linkStyle default stroke:#39546a,stroke-width:1px,fill:none;

classDef external fill:#c0d89d,stroke:#39546a;
class deck,api external

classDef split fill:#42f4c2,stroke:#39546a;
class clouddriver-caching,clouddriver-ro,clouddriver-ro-deck,clouddriver-rw,echo-scheduler,echo-worker split
{{< /mermaid >}}

## Recoverability

If you've [configured an external Redis](/docs/setup/productionize/caching/externalize-redis/), Spinnaker can recover from failure events. Igor is responsible for polling the state store (Redis) and recreating state. During a recovery, numerous old pipelines may be re-triggered. To protect against this scenario, Igor has a setting called `pollingSafeguard.itemUpperThreshold`, which is the max number of pipeline triggers to accept before recognizing the scenario of numerous old re-triggers and stopping the state update. [Read the inline documentation for this setting](https://github.com/spinnaker/igor/blob/22106ca4efb36d32d65650877c98425fcab77395/igor-core/src/main/java/com/netflix/spinnaker/igor/IgorConfigurationProperties.java#L86).

Although it's possible, it is not recommended to use spot instances on AWS or preemtible nodes to lower cost in production, as outages in your continuous deployment tool will likely cost more than any savings. Also consider hosting Spinnaker on isolated infrastructure to reduce the possibility that other applications or teams will affect your Spinnaker instance.

It's also recommended to spread out services over multiple availability zones, as described in [the Netflix implementation](https://blog.spinnaker.io/scaling-spinnaker-at-netflix-part-1-8a5ae51ee6de).
