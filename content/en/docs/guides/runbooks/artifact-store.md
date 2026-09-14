---
title: "Artifact Store"
linkTitle: "Artifact Store"
weight: 2
description: "Spinnaker copies embedded artifacts into the execution context every time a stage touches them. The artifact store persists them once to external storage and leaves a small reference behind, which can cut execution size dramatically."
---

## Overview

Spinnaker records everything an execution did in the pipeline context. Whenever a stage uses
an artifact, the artifact's full content is copied into that context, so a single artifact used
by several stages is stored many times over. For pipelines with large artifacts this dominates
the size of the execution.

The artifact store persists the artifact content once to external storage and replaces the
inline content with a reference:

```
ref://<spinnaker-application>/<content-hash>
```

An `embedded/base64` artifact becomes a `remote/base64` artifact whose `reference` is that URI.
The saving depends heavily on how large your artifacts are and how many stages touch them; the
implementation notes report improvements around 80% for some pipelines.

This page covers the artifact store itself. To also move large **manifests** out of the
context, see [Reducing Execution Size with the Entity Store](../entity-store/), which builds
on the artifact store and requires it to be configured first.

## How it works

Storage and retrieval hang off Jackson serialization rather than explicit calls in each
service, which keeps the change surface small. Each service registers custom bean serializers
and deserializers at startup, so artifacts are stored or expanded as they cross service
boundaries.

The services play different roles:

- **Rosco** bakes artifacts. When it answers a bake request, its serializer stores the result
  and returns a `remote/base64` artifact instead of an `embedded/base64` one.
- **Clouddriver** expands artifacts. Its deserializers expand any artifact in an incoming
  request, since a request carrying an artifact usually intends to operate on it. It also
  serves `/artifact/fetch`, which always returns the full `embedded/base64` content.
- **Orca** orchestrates, and stores expected artifacts to keep the context small. It also
  handles matching an `embedded/base64` artifact against a `remote/base64` one by retrieving
  the stored content and comparing, so existing pipelines keep working.

SpEL stays backwards compatible through a custom Spring converter that recognises a remote
base64 URI and retrieves it on demand.

## Configuration

The artifact store spans several services, so put the configuration in `spinnaker-local.yml`
so every service picks it up:

```yaml
artifact-store:
  type: s3
  s3:
    enabled: true
    bucket: some-artifact-store-bucket
```

There is no single `artifact-store.enabled` flag. The store becomes active when you select a
`type` and enable that backend.

{{% alert color="warning" title="Important" %}}
Give the bucket [object lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html).
Content is addressed by hash, so the same artifact is written to the same key, and object lock
is what prevents concurrent writes to that key from conflicting.
{{% /alert %}}

### S3 and S3-compatible stores

[S3](https://aws.amazon.com/s3/) is the backend that ships today. Several authentication paths
are supported:

```yaml
artifact-store:
  type: s3
  s3:
    enabled: true
    bucket: some-artifact-store-bucket
    profile: dev          # authenticate with a named profile from the AWS credentials file
    region: us-west-2
    # or supply credentials explicitly:
    accessKey: <access-key>
    secretKey: <secret-key>
```

| Property | Default | Purpose |
| -------- | ------- | ------- |
| `artifact-store.type` | _unset_ | Selects the backend. Use `s3`. |
| `artifact-store.s3.enabled` | `false` | Enables the S3 backend. |
| `artifact-store.s3.bucket` | _unset_ | Bucket that holds the artifact content. |
| `artifact-store.s3.profile` | _unset_ | Named profile from the AWS credentials file. |
| `artifact-store.s3.region` | _unset_ | Region for the client. |
| `artifact-store.s3.url` | _unset_ | Override the endpoint, for S3-compatible stores. |
| `artifact-store.s3.accessKey` | _unset_ | Access key, when not using a profile or instance role. |
| `artifact-store.s3.secretKey` | _unset_ | Secret key, when not using a profile or instance role. |
| `artifact-store.s3.forcePathStyle` | `true` | Use path-style addressing rather than virtual-host style. |

Although the implementation is S3-specific, any S3-compatible store works by pointing `url` at
it — see [Testing locally](#testing-locally).

### Limiting which applications are stored

Two independent controls decide whether a given artifact is stored. They work in opposite
directions, so it is worth being clear about which one you want.

`applicationsRegex` is an **allowlist**. When set, only applications whose name matches are
stored; everything else is left inline. Matching is case-insensitive and must match the whole
application name.

```yaml
artifact-store:
  applicationsRegex: "(team-a|team-b)-.*"
```

`exclude` is a **denylist**, scoped per artifact type. Each entry pairs the artifact `type`
with a `value` regex matched against the application name; a match means that type is *not*
stored for that application. The type is the type the artifact would have had before storage,
such as `embedded/base64` or `embedded/map/base64`.

```yaml
artifact-store:
  exclude:
    - type: "embedded/map/base64"
      value: "bad-application"
```

The `value` regex must match the whole application name, so `bad-application` matches only
that application while `bad-.*` matches the whole family. The nested `type`/`value` shape
exists because YAML keys cannot contain the `/` in an artifact type.

### Rosco and Helm

If pipelines pass artifact references into bake stages as parameters, let Rosco expand those
URIs back into full references:

```yaml
artifact-store:
  type: s3
  helm:
    expandOverrides: true
```

## Testing locally

Any S3-compatible store works, so you do not need AWS to try this out.
[SeaweedFS](https://github.com/seaweedfs/seaweedfs) runs in a single container:

```bash
docker run -p 8333:8333 chrislusf/seaweedfs server -s3
```

Point the store at it:

```yaml
artifact-store:
  type: s3
  s3:
    enabled: true
    url: http://localhost:8333
    bucket: some-artifact-store-bucket
```

Start Spinnaker and run a pipeline that uses an artifact. Reference links should appear in the
pipeline context in place of the inline content.

## Troubleshooting

**Artifacts are not being stored.** Storage is skipped, and the artifact left inline, in
several cases that are logged rather than raised as errors:

- The request carries no Spinnaker application, logged as `failed to retrieve application from
  request`. Storage is keyed by application, so it cannot proceed without one.
- The application does not match `applicationsRegex`, or matches an `exclude` entry for that
  artifact type.
- The artifact's reference is not valid base64, logged as `Artifact cannot be stored due to
  reference not being base64 encoded`. This can happen when SpEL is used inside an artifact or
  the pipeline JSON was edited by hand. The artifact is returned unstored rather than failing
  the stage.

**Executions still look large.** The artifact store only moves artifacts. Large manifests are
not artifacts, and are handled by the
[entity store](../entity-store/) instead.

## See also

- [Reducing Execution Size with the Entity Store](../entity-store/) — extends this mechanism to
  manifests and other arbitrary context objects.
- [Orca: Excluding Keys from Stage Outputs](../orca-reduce-execution-size-stage-outputs/) — a
  complementary way to shrink executions, by not propagating large keys at all.
