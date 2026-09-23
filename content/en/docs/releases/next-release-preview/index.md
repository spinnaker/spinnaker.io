---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.4.0

## Breaking Changes

### Helmfile hooks and post-renderers are now blocked by default
[#8015](https://github.com/spinnaker/spinnaker/pull/8015) and
[#8034](https://github.com/spinnaker/spinnaker/pull/8034) close a local-code-execution
vector in Rosco's helmfile baking: a `helmfile.yaml` (a user-supplied input artifact,
potentially from a git branch anyone can push to) could declare `hooks:` or
`postRenderers:`/`--post-renderer` args that run an arbitrary local command during an
otherwise side-effect-free `helmfile template` bake.

Rosco now parses the resolved helmfile.yaml (including local `bases:`/`helmfiles:`
fragments) and refuses to bake content that declares hooks or post-renderers, fails
closed on anything it can't fully parse (Go template control-flow, deeply nested YAML,
unresolvable remote references), and sets `HELMFILE_DISABLE_HOOKS=true` /
`HELMFILE_DISABLE_INSECURE_FEATURES=true` on the helmfile subprocess itself to close
gaps static YAML inspection can't see (`exec`/`envExec`/`readFile`/`readDir` template
functions). Plain `helm template` and `kustomize build` baking are unaffected.

Operators who trust their helmfile sources and rely on hooks or post-renderers can opt
back in with:
```yaml
helmfile:
  allow-hooks-and-post-renderers: true
```

### Namespace allow-lists are now enforced when a request omits a namespace
[#7998](https://github.com/spinnaker/spinnaker/pull/7998) fixes a Kubernetes account
`namespaces` allow-list bypass: a manifest operation (deploy, delete, patch, scale,
enable/disable, rollout pause/resume/undo, rolling restart, resize-server-group) that
omitted a namespace skipped the allow-list check entirely, while kubectl still resolved
a real target underneath — the kubeconfig context's default namespace, typically
`default`.

A blank, namespace-scoped coordinate is now defaulted to `"default"` before validation,
so it's checked like any other namespace. **Accounts with a `namespaces` allow-list that
does not include `"default"` will now reject an operation that omits a namespace**,
where before it silently succeeded against whatever the kubeconfig context resolved to.
Accounts whose allow-list includes `"default"`, or that don't restrict namespaces at
all, see no change.

### Java 25 required to build
[#8014](https://github.com/spinnaker/spinnaker/pull/8014) upgrades every service's
build toolchain from Java 17 to Java 25 (Dockerfiles, CI workflows, and Gradle
toolchain/source/target compatibility). Anyone building services or plugins from source
needs a Java 25 JDK.

### Spring Boot 4.1.1
[#7996](https://github.com/spinnaker/spinnaker/pull/7996) migrates the codebase to
Spring Boot 4.1.1 (Spring Cloud 2025.1.3, Kotlin 2.3.21, Gradle 9.6.1), still running on
Java 17 at the framework level. The migration is intended to preserve existing behavior
and public contracts, but this is a broad framework major-version upgrade touching
Jakarta, Security, OpenSAML, health endpoints, Redis, JDBC, Quartz, and more — plugins
or forks with custom Spring configuration should review compatibility before upgrading.

### `com.netflix.awsobjectmapper` removed — last real path to the AWS SDK v1
[#8020](https://github.com/spinnaker/spinnaker/pull/8020) removes `awsobjectmapper`,
which transitively pulled in the entire AWS SDK v1 (25 `aws-java-sdk-*` artifacts)
purely to configure clouddriver's shared `ObjectMapper`. It's replaced with a small
in-repo factory (`AwsObjectMapperFactory`) carrying the same Jackson feature flags,
including `FAIL_ON_UNKNOWN_PROPERTIES=false` for reading already-persisted JSON. Any
plugin or fork that still depends on AWS SDK v1 types transitively through clouddriver
should vendor that dependency directly going forward. Paired with
[#8038](https://github.com/spinnaker/spinnaker/pull/8038), which updates the AWS SDK v2
dependency itself to its latest release.

## Features

### SQL-backed artifact/entity store
[#8000](https://github.com/spinnaker/spinnaker/pull/8000) adds a SQL-backed
`ArtifactStoreGetter`/`ArtifactStoreStorer` implementation alongside the existing
S3-compatible [artifact store]({{< ref "docs/guides/runbooks/artifact-store" >}}),
so operators on Azure, or anyone without an S3-compatible object store, can use entity
storage. Content is addressed by `(application, hash)` — the same identity the S3
backend uses — so identical content stored more than once collapses to a single row.

The SQL backend reuses the host service's existing `sql.connection-pools` by default
(`artifact-store.sql.connectionPool` can point it elsewhere), and manages its own
Liquibase migration independently of the host service's own schema. As with the S3
backend, every participating service (clouddriver, orca) must point at the same
physical database for stored references to be readable across services.

### Per-service SBOM generation, starting with clouddriver
[#8019](https://github.com/spinnaker/spinnaker/pull/8019) adds a `cyclonedxBom` Gradle
task to every service, producing a CycloneDX 1.6 software bill of materials that
aggregates all of a service's subprojects — matching the unit Spinnaker actually ships
(one container image per service). It's wired into the release pipeline for
`clouddriver` first, attaching a buildx/Syft SBOM attestation to published container
images; other services default to no behavior change until they're opted in.

### Discover project pipelines by tag
[#7934](https://github.com/spinnaker/spinnaker/pull/7934) lets a Deck project dashboard
combine manually configured pipelines with pipelines discovered by an exact,
case-sensitive `project` tag match, grouped by application, alongside each one's latest
execution (or a `Never run` link). Includes an RBAC-filtered fallback to the manual
pipeline list if discovery fails.

### Opt-in support for hyphenated SpEL variable names
[#7983](https://github.com/spinnaker/spinnaker/pull/7983) addresses a long-standing SpEL
limitation: an expression like `${my-container-name}` is tokenized as `my - container -
name` (arithmetic) rather than a variable named `my-container-name`, which breaks any
manifest, parameter, or context value with a legitimate hyphen (for example, Kubernetes
container or label names).

Enable it with:
```yaml
expression:
  dashed-identifiers:
    enabled: true
```
When enabled, an expression that fails to evaluate because its entire body is a
hyphen-joined bareword is retried as a literal key lookup before failing. This is
off by default and never changes the result of an expression that already succeeds
(real arithmetic like `${trigger.buildNumber - 1}` is untouched); Deck's "Evaluate
Variables" stage validator picks up the same flag via `/capabilities/expressions` so
the UI and runtime can't disagree. Compound paths mixing `.` and `-` (for example
`${metadata.labels.app-name}`) are not yet rewritten.

### Distinguish same-kind Kubernetes manifests in Deploy (Manifest) status
[#8044](https://github.com/spinnaker/spinnaker/pull/8044) adds the manifest name
alongside its kind in the Deploy (Manifest) stage status, so it's possible to tell
apart multiple manifests of the same kind (for example several ConfigMaps or Secrets)
at a glance.

## Fixes

### Orca: zombie executions from a queue-ack race on looping/redirecting stages
[#7919](https://github.com/spinnaker/spinnaker/pull/7919) fixes a race in the Redis
queue's message-acknowledgement path that could permanently drop a `RunTask` message
for stages that loop or redirect between tasks (`REDIRECT` status), leaving the
execution stuck. The check-then-delete acknowledgement is now a single atomic Lua
script, matching how message delivery (`poll()`) already worked. The equivalent defect
in `RedisClusterQueue` is a known, separate limitation not fixed by this change.

### Orca: more robust handling of transient Redis connection errors
[#8002](https://github.com/spinnaker/spinnaker/pull/8002) adds retry-with-backoff
around Redis queue pushes, registers Jedis connection exceptions as retryable at the
handler level, and preserves/restores stage or execution status around queue
operations that fail after a status change — closing several paths that could leave a
pipeline permanently stuck after a transient Redis read timeout.

### Orca: pagination, boundary, and filter bugs in pipeline trigger search
[#8026](https://github.com/spinnaker/spinnaker/pull/8026) fixes several bugs in
`/applications/{application}/pipelines/search`: requests for a page beyond the first
could return truncated or empty results, executions whose trigger time exactly matched
a start/end boundary were silently dropped, `pipelineName` was ignored whenever
`application` was `"*"`, and a malformed `trigger` parameter returned a 500 instead of
a 400.

### Entity store: stored manifest references keep their kind, name, and namespace
[#7999](https://github.com/spinnaker/spinnaker/pull/7999) restores metadata that was
previously dropped when a deploy-manifest payload is swapped for a `ref://` pointer in
the execution context. Deck's Deploy status now renders a "Kind namespace/name" label
next to the details link instead of an opaque link-only fallback. References stored
before this fix render as before.

### Front50: `staleCheck` optimistic-concurrency check on pipeline saves
[#8022](https://github.com/spinnaker/spinnaker/pull/8022) fixes `?staleCheck=true` on
pipeline saves, which has been a silent no-op since a 2022 refactor — Deck has sent
this parameter on every save for years with no effect. The fix is gated behind a new,
**default-off** flag (`controller.pipeline.save.stale-check-enabled`), so behavior is
unchanged until an operator explicitly opts in for a later release.

### Deck: Kubernetes manifest editor no longer clips the last line
[#7920](https://github.com/spinnaker/spinnaker/pull/7920) replaces the long-unmaintained
`brace` Ace editor bindings with current `ace-builds`, fixing long manifests being
clipped behind the editor's horizontal scrollbar.

### Deck: Kubernetes Deployment details link
[#8004](https://github.com/spinnaker/spinnaker/pull/8004) fixes the manifest "Details"
link not appearing for Deployment resources in some cases.

### Deck and ECS/Lambda: assorted fixes
- [#7973](https://github.com/spinnaker/spinnaker/pull/7973) fixes a case-sensitivity bug
  in `virtualizationType` comparison that could under-populate available instance types.
- [#7960](https://github.com/spinnaker/spinnaker/pull/7960) fixes ECS's
  `Application.clusterNames` to report actual Spinnaker cluster names instead of
  versioned ECS service names.

### Echo: usage telemetry now reports the real service version
[#7966](https://github.com/spinnaker/spinnaker/pull/7966) fixes `stats.spinnaker-version`
in usage telemetry sent to `stats.spinnaker.io`, which previously always reported
`"unknown"` because the version wasn't wired up from the service's own build metadata.

### Gate MCP: fixed a startup failure
[#7987](https://github.com/spinnaker/spinnaker/pull/7987) fixes `gate-mcp` failing to
start with a `BeanInstantiationException` because its resource methods returned raw
maps/lists, which the MCP annotations library doesn't accept as a return type. Results
are now serialized to JSON strings.
