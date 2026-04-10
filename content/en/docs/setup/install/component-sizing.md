---
title: "Component Sizing"
description: Size your Spinnaker services to meet your usage requirements.
---

## CPU & Memory requests/limits

Container requests and limits for cpu and memory can be specified in the `spinnaker-kustomize/base/*/deployments.yml`
files.  Watch for OutOfMemory exceptions and monitor JVM Memory, CPU usage, and similar
metrics to keep spinnaker up and running.

Limits and requests can be set per [kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/).

#### Updating JAVA_OPTS

All JVM-based services have the following JAVA_OPTS that can be set to adjust things like memory
or additional flags.  You can add these to the deployment ENV variables:

```
JAVA_OPTS=-XX:MaxRAMPercentage=50.0
```

This sets the JVM's heap size to half the memory allocated per container. This can be overriden by specifying your own
`JAVA_OPTS` using the `env` flags.  Generally, for large production systems, setting explicit -Xmx and -Xms to be the
same value and sized for your environment is recommended to reduce allocation times.  JVM tuning is an entire
separate discussion that should be had with JVM experts or looking at documentation.

As a starting point, the `-Xms` can be set to 80%-90% of the requests memory allotment and `-Xmx` can be set to 80-90%
of the limits memory allotment.  It's recommend NOT to make this too large for clouddriver
or processes that fork to external operations (Rosco for bakes).  This is due to those processes not using JVM memory
but OS memory.  


#### Recommendations

Optimal sizing for your components will depend upon your environment, but in general clouddriver and orca will need to
be larger than the rest of the components as they're continuously processing information. Additionally, echo may also
need to be larger if using event hooks to external systems or processing large pub/sub payloads.

### Replicas

All spinnaker services CAN be deployed with multiple replicas for availability. There are configurations
required to enable locking or to prevent concurrent operations.

* For igor, locking must be enabled to run multiple replicas. This is defaulted on in spinnaker-kustomize. When running
  a single pod, you can turn locking off.
* For echo, make sure to use a SQL database. Echo uses a quartz scheduler and may need additional adjustment depending
  upon configuration. Read
  the [readme for echo for more information](https://github.com/spinnaker/spinnaker/tree/main/echo#missed-cron-scheduler)
* For other services, like clouddriver, using a shared redis and clouddriver should be all that's needed to run multiple
  replicas of all services.
