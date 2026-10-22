---
title: "Amazon ECS native deployments"
linkTitle: "Amazon ECS (native)"
weight:
description: >
  How the opt-in `ecs-native` deployment mode maps Spinnaker concepts onto a single, durable Amazon ECS service
  and what each Spinnaker operation does to it.
---

The [Amazon ECS provider](/docs/reference/providers/ecs/) creates a new ECS service for every deploy and keeps the
previous services around as separate server groups. *Native deployments* are an opt-in alternative: one durable ECS
service per cluster, updated in place with the ECS deployment features (rolling, blue/green, circuit breaker,
deployment alarms, bake time and lifecycle hooks). Spinnaker orchestrates the ECS deployment instead of replacing the
service.

Native deployments use the same ECS accounts, caching and permissions model as the classic provider. Nothing has to
be enabled in Clouddriver; the mode is selected per deploy stage with the "Use native ECS deployment" checkbox. See
[Native ECS deployments](/docs/setup/install/providers/aws/aws-ecs/#native-ecs-deployments) for the account
requirements.

## When to use it

Use native deployments when you want ECS itself to run the rollout: a fixed service name and ARN that external
tooling can rely on, ECS blue/green with ALB traffic shifting, automatic rollback on a circuit breaker or CloudWatch
alarm, or a service that Terraform creates and Spinnaker only deploys to.

Stay with the classic provider when you rely on side-by-side server groups: red/black with a long-lived previous
version, rollback by re-enabling an older server group, or Spinnaker-managed canaries on separate services.

## Resource mapping

| Spinnaker concept | Native deployments |
| --- | --- |
| Server group | One durable ECS service per cluster and application/stack/detail. The service name is the fixed `<app>-<stack>-<detail>` name without a `-vNNN` sequence. |
| Instance | An ECS task, as in the classic provider. |
| Cluster | The Spinnaker cluster contains exactly one native server group per region. Classic `-vNNN` server groups of the same application/stack/detail appear in the same Spinnaker cluster. |
| Rollout identity | The ECS *service deployment* ARN returned by ECS for each create or update. Spinnaker waits on and acts on that ARN; it never infers it from the service or task-definition name. |

### Ownership tag

A native service carries the tag `spinnaker:provider=ecs-native`. The tag, not the name, marks the service as owned
by native deployments:

* The first deploy creates the service and writes the tag.
* Later deploys describe the fixed-name service with its tags and update it only when the tag is present and the
  service is `ACTIVE` or `DRAINING`. An existing service with the same name but without the tag is treated as
  external and the deploy fails instead of taking it over. Tag the service yourself if you want Spinnaker to adopt it
  (see [Services created outside Spinnaker](#services-created-outside-spinnaker)).
* Disable, enable, destroy, resize and rollback refuse to touch a service without the tag.
* A classic ECS deploy rejects the reserved tag key, so a classic server group cannot be made to look native.

Classic operations do not check the tag. It is an ownership marker for routing, not an isolation boundary between
the two modes: a classic destroy aimed at a native service name still runs.

Because tagging is mandatory, the account must be opted into the long ECS resource ID format (see
[`tags` naming strategy](/docs/reference/providers/ecs/#tags-naming-strategy)). Creating a native service fails before any
write when tagging is not available.

## Operation mapping

### Deploy

The first deploy registers a task definition and creates the service with the tag. Every later deploy registers a
new task-definition revision and calls `UpdateService` on the existing service with the native deployment
configuration. The deploy stage then waits for that ECS service deployment to reach `SUCCESSFUL`; a rollback,
stop or failure state fails the stage. Waiting for healthy instances alone is not enough for an in-place rollout,
because tasks of the previous revision can still be running while the new revision is rolling out.

The Spinnaker deployment strategy must be `None`. The ECS deployment strategy (`ROLLING` or `BLUE_GREEN`) is a
separate setting and controls the rollout; a Spinnaker red/black strategy conflicts with the single-service model and
is rejected.

#### Capacity

Application Auto Scaling remains the owner of min/max capacity. "Copy existing capacity" (on by default) decides
what a redeploy does:

* **On**: the deploy sends no desired count and does not touch the scalable target. The autoscaled task count and
  the scalable target's min/max, scaling policies and suspended state stay as they are.
* **Off**: the deploy sets the desired count from the stage and re-registers the scalable target with the stage's
  min/max. Re-registering clears a suspended state set by an earlier Disable.

Note that "copy existing capacity" copies the *current* desired count. A redeploy of a disabled service (desired count
`0`) with the option on keeps it at `0`.

Everything else (network configuration, load balancers, service registries, placement, capacity provider strategy,
platform version, health-check grace period) always comes from the stage, with the live value used only for a field
the stage leaves unset.

#### Deployment settings

| Setting | Effect |
| --- | --- |
| Deployment strategy | `ROLLING` (default) or `BLUE_GREEN`. |
| Minimum healthy percent / maximum percent | Passed through to the ECS deployment configuration. |
| Enable deployment circuit breaker / circuit breaker rollback | ECS stops a deployment whose tasks keep failing and, with rollback, returns to the last successful service revision. |
| Deployment alarms / roll back on alarm | ECS fails (and optionally rolls back) a deployment when one of the named CloudWatch alarms is in alarm. |
| Bake time (minutes) | Used by blue/green deployments: how long ECS keeps the previous revision running after production traffic has shifted, so the deployment can still roll back. |
| Pause for approval | Blue/green only. Adds an ECS `PAUSE` lifecycle hook at one of `POST_SCALE_UP`, `POST_TEST_TRAFFIC_SHIFT`, `PRE_PRODUCTION_TRAFFIC_SHIFT` or `POST_PRODUCTION_TRAFFIC_SHIFT`, with a timeout in minutes and a timeout action (`ROLLBACK` by default, or `CONTINUE`). |
| Alternate target group, production and test listener rules, blue/green role | Blue/green only. The ALB traffic-shift configuration ECS needs; all four must be set together for a load-balanced blue/green service. |

### Blue/green with a pause

With a pause stage configured, the deploy stage succeeds as soon as the lifecycle hook reaches `AWAITING_ACTION`.
The ECS deployment is now paused, with test traffic or production traffic already shifted depending on the chosen
stage. Two pipeline stages act on it:

* **Continue ECS Native Service Deployment** sends `CONTINUE` or `ROLLBACK` to the hook. A requested rollback is a
  successful stage outcome: the pipeline asked for it and ECS performed it.
* **Stop ECS Native Service Deployment** stops the ECS deployment with a rollback and waits for the rollback to
  finish. ECS only accepts stop type `ROLLBACK` here.

Both stages reference the preceding native deploy stage. The deploy may be any number of stages upstream, so a
Manual Judgment between deploy and Continue is the usual pattern. When no Continue stage acts before the pause
timeout, ECS applies the configured timeout action on its own.

If a deploy stage deploys to several clusters, the Continue and Stop stages cannot tell which ECS deployment is
meant and fail with an error; set "Expected service deployment ARN (legacy fallback)" on the stage to the
right ARN, or split the deploy stage.

A deploy stage that times out while the ECS deployment is still in progress fails the stage but does not stop the
ECS deployment. Add a Stop stage on the failure path if the rollout must not continue unattended.

### Rollback

Rollback of a native server group picks an earlier task-definition revision of the same service and deploys it with a
forced new deployment, using the service's current deployment configuration. There is no previous server group to
re-enable.

### Disable and Enable

Disable suspends scheduled scaling, dynamic scale-in and dynamic scale-out on the service's Application Auto Scaling
target and sets the desired count to `0`. The service, task definitions, scaling policies and scalable target are
kept. Because there is only one service, Disable stops the application: no other server group keeps serving.

Enable sets the desired count to the scalable target's maximum capacity (or `1` when the service has no scalable
target) and resumes scaling. This is what the classic provider does once every server group of a cluster has been
disabled; neither mode records the desired count a service had before it was disabled.

### Resize

Sets the desired count on the service and re-registers the scalable target with the given minimum and maximum
capacity. Autoscaling policies may change the desired count again.

### Destroy

Deletes the alarms and scalable targets found through the service's scaling policies, scales the service to `0`,
deletes the service and deregisters its current task-definition revision. Older task-definition revisions are not
removed.

### Unsupported for native server groups

* **Clone** is rejected. Cloning cannot produce a safe durable-service identity; use a deploy stage instead.
* **Terminate instances** is rejected, because task IDs alone do not prove the tasks belong to an owned service.
* **Scaling policy upsert and delete** from Spinnaker are rejected for the same reason; manage policies in AWS or
  with Terraform.
* **Start** has no effect.

## Switching between classic and native

There is no in-place migration of an ECS service from one mode to the other. Switching is a deploy of the new kind
followed by the removal of the old server groups:

1. Add a deploy stage with "Use native ECS deployment" on for the same application, stack and detail, pointing at the
   same target group. The native service (fixed name, ownership tag) is created next to the classic `-vNNN`
   server groups and both serve traffic through the shared target group, exactly like any side-by-side deploy.
2. Verify the native service.
3. Disable and destroy the classic server groups as explicit pipeline steps. Native deploys ignore the classic
   `source` server group; nothing is disabled automatically.

The reverse works the same way: a classic deploy allocates the next `-vNNN` name (`-v000` when none exists) next to
the native service and leaves it running. Both kinds of server groups show up in the same Spinnaker cluster.

## Services created outside Spinnaker

Terraform (or anything else) can create the service once and Spinnaker can deploy to it afterwards:

* Name the service `<app>-<stack>-<detail>`, the fixed name the deploy computes.
* Tag it `spinnaker:provider = ecs-native`.
* Keep "copy existing capacity" on so Spinnaker does not touch the desired count or a Terraform-managed
  `aws_appautoscaling_target`.
* Make Terraform ignore what Spinnaker writes on every deploy: `task_definition`, `desired_count` and
  `deployment_circuit_breaker` always; and whichever of `deployment_minimum_healthy_percent`,
  `deployment_maximum_percent`, `alarms`, `enable_execute_command`, `load_balancer`, `network_configuration`,
  `service_registries`, `placement_constraints`, `ordered_placement_strategy`, `capacity_provider_strategy`,
  `platform_version` and `health_check_grace_period_seconds` the stage sets. Deployment strategy, bake time and
  lifecycle hooks are written by Spinnaker too; check that your AWS provider version exposes them before managing
  them in Terraform.

```hcl
resource "aws_ecs_service" "app" {
  name            = "myapp-prod"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.bootstrap.arn
  desired_count   = 2
  tags            = { "spinnaker:provider" = "ecs-native" }

  lifecycle {
    ignore_changes = [task_definition, desired_count, deployment_circuit_breaker]
  }
}

resource "aws_appautoscaling_target" "app" {
  service_namespace  = "ecs"
  scalable_dimension = "ecs:service:DesiredCount"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  min_capacity       = 2
  max_capacity       = 6
}
```

## Limits

* The ownership check and the update are two separate ECS calls. A service re-tagged or deleted in between can
  make the update fail or act on a changed service; Spinnaker does not lock ECS resources.
* A `DRAINING` service counts as existing. A deploy that finds the fixed-name service draining fails until ECS has
  finished removing it.
* Continue, Stop and the deploy wait act only on the exact service deployment ARN they were given or resolved. They
  do not act on a deployment started outside the pipeline.
