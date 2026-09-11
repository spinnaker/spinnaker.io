---
title: "Orca: Reducing Execution Size by Excluding Keys from Stage Outputs"
linkTitle: "Orca: Excluding Stage Outputs"
weight: 2
description: "Some Orca tasks copy large objects such as manifests and artifacts into a stage's outputs, which are then propagated for the rest of the execution. You can configure Orca to exclude those keys and keep executions considerably smaller."
---

## Overview

Every stage in an Orca execution has a `context` and an `outputs` map:

* `context` is scoped to the stage. It holds whatever the stage's tasks need in order to do
  their own work.
* `outputs` is promoted to the execution and made visible to downstream stages, so anything a
  task writes there is stored with the execution and travels with it for the remainder of the
  pipeline.

A handful of tasks write large objects (full Kubernetes manifests, artifact lists, raw job
status payloads) into `outputs`. Because `outputs` is propagated, those objects are persisted
repeatedly across the execution, which inflates the execution document in Orca's database, the
payloads Deck fetches when rendering an execution, and Orca's memory footprint while the
pipeline runs.

Since Spinnaker 1.36.0 ([orca#4781](https://github.com/spinnaker/orca/pull/4781)) you can
configure a set of keys to exclude from `outputs` for a specific set of tasks. The keys are
still written to the stage's own `context`, so the stage keeps working as before — they are
simply not promoted to the execution.

{{% alert color="warning" title="Important" %}}
Because the excluded keys are no longer present in `outputs`, they cannot be referenced from
downstream stages via SpEL (for example `${#stage('Deploy')['outputs']['manifests']}`).
Check your pipelines for expressions that read the keys you plan to exclude before rolling
this out.
{{% /alert %}}

## Supported tasks

Four tasks support exclusion today. The exact key names differ per task, and they are matched
literally — note that `PromoteManifestKatoOutputsTask` stores its keys with an `outputs.`
prefix, which is part of the key name and must be included in your configuration.

| Task | Config prefix | Keys you can exclude |
| ---- | ------------- | -------------------- |
| `PromoteManifestKatoOutputsTask` | `tasks.clouddriver.promoteManifestKatoOutputsTask` | `outputs.manifests`, `outputs.manifestNamesByNamespace`, `outputs.boundArtifacts`, `outputs.createdArtifacts`, `artifacts` |
| `WaitOnJobCompletion` | `tasks.clouddriver.waitOnJobCompletionTask` | `jobStatus`, `completionDetails`, `propertyFileContents` |
| `ResolveDeploySourceManifestTask` | `tasks.clouddriver.resolveDeploySourceManifestTask` | `manifests`, `requiredArtifacts`, `optionalArtifacts` |
| `BindProducedArtifactsTask` | `tasks.core.bindProducedArtifactsTask` | `artifacts`, `resolvedExpectedArtifacts` |

The default for every `excludeKeysFromOutputs` property is an empty set, so this feature is
off until you configure it.

## Configuration

Add the following to `orca-local.yml`:

```yaml
tasks:
  clouddriver:
    promoteManifestKatoOutputsTask:
      excludeKeysFromOutputs:
        - outputs.createdArtifacts
        - outputs.manifests
        - outputs.boundArtifacts
    waitOnJobCompletionTask:
      excludeKeysFromOutputs:
        - jobStatus
        - completionDetails
    resolveDeploySourceManifestTask:
      excludeKeysFromOutputs:
        - manifests
        - requiredArtifacts
        - optionalArtifacts
  core:
    bindProducedArtifactsTask:
      excludeKeysFromOutputs:
        - artifacts
```

Each of these tasks logs the keys it was told to filter at startup and the keys that survived
filtering on each execution, so you can confirm the configuration was picked up:

```
output keys to filter: [outputs.manifests, outputs.boundArtifacts, outputs.createdArtifacts]
context outputs will only contain: [outputs.manifestNamesByNamespace, artifacts] keys
```

## Before and after

The following comparison comes from running the same simple pipeline twice — once with the
default configuration and once with the configuration above — and exporting the resulting
execution JSON from `/pipelines/{executionId}` in Orca.

| Measurement | Default configuration | Keys excluded | Reduction |
| ----------- | --------------------- | ------------- | --------- |
| Total lines | 4458 | 3291 | ~26% |
| Size on local disk | 147 KB | 104 KB | ~29% |

The gain scales with how much of your context is made up of the excluded objects. A pipeline
that deploys many manifests or binds many artifacts, or one with a long chain of stages that
each re-propagate the same `outputs`, will see a larger reduction than the simple pipeline
measured above. Conversely, a pipeline that does not run any of the four supported tasks sees
no change at all.

To reproduce the measurement on your own pipeline:

```bash
# Fetch the execution as stored by Orca and measure it.
curl -s "$ORCA_URL/pipelines/$EXECUTION_ID" | jq . > execution.json
wc -l execution.json
du -h execution.json
```

Run this once before applying the configuration and once after, using the same pipeline and
the same inputs.

## Rollout guidance

1. Start with the keys that are largest and least likely to be referenced. `outputs.manifests`
   and `outputs.createdArtifacts` from `PromoteManifestKatoOutputsTask` are usually the biggest
   win for Kubernetes deployments; `jobStatus` and `completionDetails` are the biggest win for
   pipelines that run jobs.
2. Search your pipelines for SpEL expressions referencing those keys, and check any custom
   stages or plugins that read from a previous stage's `outputs`.
3. Roll out to a non-production Spinnaker first and run representative pipelines end to end.
   Excluding a key that a downstream stage depends on surfaces as an expression evaluation
   failure or a missing value in that stage, not as an error in the stage that produced it.
4. Keep `outputs.manifestNamesByNamespace` unless you are certain nothing consumes it — Deck
   and several downstream Kubernetes stages use it to locate deployed resources.
