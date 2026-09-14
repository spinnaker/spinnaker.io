---
title: "Reducing Execution Size with the Entity Store"
linkTitle: "Entity Store"
weight: 2
description: "The entity store extends artifact storage to arbitrary objects in the execution context, most usefully Kubernetes manifests. Manifests are stored once externally and replaced with a small reference, which has cut execution size by up to 85% on large pipelines."
---

## Overview

The [artifact store](../artifact-store/) moves artifact content out of the execution context
and leaves a reference behind. The entity store, added in Spinnaker 2026.0.0
([spinnaker#7072](https://github.com/spinnaker/spinnaker/pull/7072)), generalises that
mechanism so it is no longer limited to Spinnaker's `Artifact` class: any object in the
context can be stored the same way.

The case that matters most in practice is manifests. Manifests are large, and they are
duplicated many times across a JSON execution — once per stage that references them. Storing
them once and referencing them thereafter is where the savings come from:

| Scenario | Reduction |
| -------- | --------- |
| A single stage deploying a simple nginx Kubernetes manifest | ~40% of that stage's size |
| Large, complex real-world pipelines | up to ~85% of execution size |

{{% alert color="warning" title="Prerequisite" %}}
The entity store writes through the artifact store, so you must
[configure an artifact store](../artifact-store/) first. Enabling the flags below without a
working artifact store does nothing useful.
{{% /alert %}}

## How it works

The entity store hooks into Jackson's serializer and deserializer *modifiers* rather than
replacing serializers outright. That preserves existing custom serializers and Jackson
annotations instead of reimplementing them.

Two registries drive it, and each is gated by its own flag:

- `SerializerHookRegistry` — the storing side. As an object is about to be serialized, the
  registry asks its handlers whether any of them can handle the object; a handler that can may
  replace it with a stored reference.
- `DeserializerHookRegistry` — the expanding side. On the way back in, handlers may expand a
  reference into the full object.

Behind each registry is a set of handlers, so which objects get stored is a matter of which
handlers are registered rather than something hardcoded. Operators configure the feature with
the two flags below; developers extending it can register their own handlers in
`EntityStoreConfiguration`.

### The `remote/map/base64` type

A stored manifest becomes an artifact of type `remote/map/base64`, deliberately *not* the
`remote/base64` type used for stored artifacts:

```json
{
  "customKind": false,
  "reference": "ref://myapplication/867867a8e7e9da56bc108b97c03bf3b532f86e9cfdf3196de277a2d77d188195",
  "metadata": {},
  "name": "stored-entity",
  "type": "remote/map/base64"
}
```

The distinct type exists because of expected-artifact resolution. Artifacts of mismatched types
do not resolve against each other, and `remote/base64` carries special logic so it still
matches `embedded/base64` for backwards compatibility. If manifests reused `remote/base64`,
a user could inject a manifest through SpEL into expected-artifact matching and get strange
behaviour — manifests are not Spinnaker artifacts. A separate type keeps expected-artifact
matching correct and lets the serializers decide what to store or expand based on type.

## Configuration

Two flags control the feature, and they are not symmetric. Both default to disabled, and both
must be set to `true` explicitly.

Enable storing across services, in `spinnaker-local.yml`:

```yaml
artifact-store:
  entities:
    enabled: true
```

Then enable expansion in **clouddriver only**, in `clouddriver-local.yml`:

```yaml
artifact-store:
  entities:
    expand: true
```

| Property | Default | Applies to | Effect |
| -------- | ------- | ---------- | ------ |
| `artifact-store.entities.enabled` | disabled | all services | Registers `SerializerHookRegistry`, so large context objects are stored on the way out. |
| `artifact-store.entities.expand` | disabled | clouddriver | Registers `DeserializerHookRegistry`, so references are expanded on the way in. |

Clouddriver is the only service that needs `expand`, because it is the service that actually
has to act on the full manifest. Enabling expansion more widely defeats the purpose, since
expanding a reference puts the full object back into memory.

## SpEL behaviour

Existing pipelines keep working, but what an expression returns changes in a way worth
understanding before you roll this out.

A custom property accessor expands a stored entity when you reach *into* it. Accessing a
property of a manifest expands that manifest:

```
${ #stage('Deploy Manifest').context.manifests[0].metadata }
```

```json
{
  "name": "nginx",
  "labels": {
    "app.kubernetes.io/name": "nginx",
    "app.kubernetes.io/instance": "nginx"
  }
}
```

Referring to the collection, or to an element without reaching into it, returns the stored
artifacts rather than the manifests:

```
${ #stage('Deploy Manifest').context.manifests }     # list of remote/map/base64 artifacts
${ #stage('Deploy Manifest').context.manifests[0] }  # a single remote/map/base64 artifact
```

This is deliberate: expanding only on property access keeps memory use down, and most
expressions want one value out of a manifest rather than the whole thing.

Three knobs adjust this behaviour:

| Property | Default | Effect |
| -------- | ------- | ------ |
| `expression.propertyExpansionTypes` | `[remote/map/base64]` | Artifact types that are expanded on property access. A stored entity whose type is not listed stays an artifact. |
| `expression.aggressiveExpansionKeys` | `[]` (empty) | Context keys that expand **all** elements whenever an expression matches the key, regardless of artifact type. |
| `#fetchReference(...)` | — | SpEL function that retrieves the full content of a reference on demand. |

Use `aggressiveExpansionKeys` sparingly — adding `manifests` makes
`${ #stage('Deploy Manifest').context.manifests }` return the full manifest list again, which
gives back the memory you were trying to save. It exists for cases where users genuinely need
to observe every manifest output.

When you want the full content in a single expression without changing global behaviour, use
the function instead:

```
${ #fetchReference(#stage('Bake Manifest').context.artifacts[0].reference) }
```

## Rollout guidance

1. Configure and verify the [artifact store](../artifact-store/) first. Confirm `ref://`
   references are showing up in pipeline contexts before turning on entity storage.
2. Enable `artifact-store.entities.enabled` across services, then
   `artifact-store.entities.expand` in clouddriver. Skipping the clouddriver flag is the most
   likely misconfiguration, and it surfaces as deploys acting on a reference rather than a
   manifest.
3. Audit pipelines for SpEL that reads whole manifest collections. Expressions that reach into
   a manifest keep working unchanged; expressions that pass a whole manifest somewhere will now
   see an artifact. Fix these with `#fetchReference`, or as a last resort by adding the key to
   `expression.aggressiveExpansionKeys`.
4. Roll out to a non-production Spinnaker and exercise deploy, bake, and any stages that
   consume manifests from a previous stage.
5. Use the artifact store's `applicationsRegex` and `exclude` filters to limit the blast radius
   while you gain confidence — `exclude` accepts `embedded/map/base64` to skip manifest storage
   for specific applications.

## See also

- [Artifact Store](../artifact-store/) — the required backing store, and the filters that
  control which applications and types are stored.
- [Orca: Excluding Keys from Stage Outputs](../orca-reduce-execution-size-stage-outputs/) — a
  complementary approach that drops large keys from stage outputs instead of storing them.
