---
layout: single
title:  "Roadmap"
sidebar:
  nav: community
---

## Project Roadmap

## Enhancements in upcoming releases without a schedule
These improvements could happen at ANY time in any of the releases.  We'd welcome input on additional features that people would like to see from the project!
* Make dynamic accounts the default account-management experience. The add/remove accounts UI landed in 2026.3.0; we still want it enabled by default going forward.
* Replace the "kubectl" based execution of kubernetes operations to native kubernetes SDK operations.
* AWS Lambda to async for invocations.  Currently lambda operations (primarily invocations) are "SYNCHRONOUS" calls.  The plan is to change these to an ASYNC which captures the execution from AWS & polls for completion instead of keeping the network connection open.  This is critical for long running operations.
* CI:  Add more CI providers to enable the UI to show build information.  GitLab CI trigger/cancel support landed in 2026.3.0; more providers are welcome.
* Bring in changes from forks.  There's a few forks that have nice features we could bring in at anytime.  Azure fixes and some UI tweaks.
* Move igor to use SQL instead of redis
* Move rosco to use SQL instead of redis

### Recently completed: 2026.3.0
The primary goal of 2026.3.0 was removing and upgrading core libraries, and it shipped a large batch of deprecations along with it. See the [full 2026.3.0 changelog]({{< ref "/changelogs/2026.3.0-changelog" >}}) for details. Highlights:
* Angular fully removed from Deck in favor of React
* Halyard and Edda removed from the codebase
* SAML configuration moved to native Spring configuration
* Front50 non-SQL storage (S3/GCS/etc.), Redis-backed Orca execution storage, and Titus are all marked deprecated for removal in 2027.0.0
* GCE migrated from the Compute beta API to stable v1
* Spin CLI API token support, a UI for adding/removing accounts, and a native Spinnaker MCP server all shipped
* GitHub App authentication for git/repo and github/file artifact accounts
* An alpha pub/sub-based cache scheduler (`cats.pubsub`) as a first step away from the Redis caching scheduler
* The AWS provider moved substantially onto the SDK v2 (EC2/ASG, ECS, SNS/SQS/SWF/CloudFormation, Lambda)

### 2026.4.0
Java 25, Spring Boot 4, and a set of security fixes have already landed on `main` ahead of this release; see the [next release preview]({{< ref "next-release-preview" >}}) for the running list as it's cut. Still in flight for this release or shortly after:

* Virtual thread support for better performance
* Merge deck-kayenta into deck.  A separate UI for kayenta at this point doesn't make sense, so collapse it down to simplify the builds and project
* Better pub/sub integration.  A [multi-phase plan](https://github.com/spinnaker/spinnaker/pull/8029) is underway to add broadcast (fan-out) and single-delivery (competing-consumer) semantics to `kork-pubsub`, backed by Redis Streams and native Redis Pub/Sub, so account-change notifications and eventually operations no longer rely on polling. Phases 0-2 are up as draft PRs ([#8029](https://github.com/spinnaker/spinnaker/pull/8029), [#8030](https://github.com/spinnaker/spinnaker/pull/8030), [#8031](https://github.com/spinnaker/spinnaker/pull/8031)); SNS/SQS broadcast support and the clouddriver account-refresh wiring that motivates all of this are still to come.
* GCP "direct" operations: a proposed V2 for the GCP provider that exposes more of the SDK's available options directly by API type, rather than the current atomic, heavily-masked operations — closer to how the Kubernetes provider works today.

Cleanup of past deprecations:
* Remove S3 storage from Front50 (Front50 becomes SQL-only)
* Keep S3 (and the new SQL option, see below) storage for the artifact/entity store used by Orca and Clouddriver — that's a separate concern from Front50's own storage
* Finish removing AWS SDK v1 support — the last real dependency path (`awsobjectmapper`) was removed ahead of this release; a bridging shim for third-party plugins that still expect v1 types may remain longer

### In discussion, not yet scheduled
These are active proposals and in-progress PRs without a committed release. Feedback and review are welcome on all of them.

* **Fiat removal.** There's a large, actively-discussed [draft PR](https://github.com/spinnaker/spinnaker/pull/7863) to replace Fiat with token-based service-to-service authorization, decoupling permission checks behind a pluggable policy-decision-point seam. Fiat is known to have scale issues with large numbers of accounts/projects and roles, and is another service to operate. Reviewers have asked for a proper RFC and a staged rollout (decouple first, remove last) before this lands, so it's not officially planned for a specific release — but plan long-term on Fiat eventually going away.
* **Artifact account permissions.** A [draft PR](https://github.com/spinnaker/spinnaker/pull/7892) would let artifact accounts (Helm, git/repo, github/file, etc.) carry `READ`/`WRITE` role permissions like cluster and CI accounts already can, so the UI can filter artifact lists by what a user is authorized to see ([issue #6592](https://github.com/spinnaker/spinnaker/issues/6592)). It's intentionally waiting on the Fiat-removal discussion above to settle, since it would need rework depending on that outcome.
* **Spectator to Micrometer.** An [active PR](https://github.com/spinnaker/spinnaker/pull/7866) removes Netflix-specific Spectator from kork in favor of the standard Micrometer abstraction, which plays much better with off-the-shelf observability tooling (including OpenTelemetry auto-instrumentation).
* **Remote runner architecture.** An early [RFC-stage PR](https://github.com/spinnaker/spinnaker/pull/8043) proposes a more modern, push-based execution model to eventually replace how Rosco bakes and how Kubernetes "Run Job" operations are handled, aimed at safer remote/distributed execution (motivated partly by the helmfile security hardening in 2026.4.0) instead of today's polling model.
* **Standardized canary query template.** A [PR in progress](https://github.com/spinnaker/spinnaker/pull/7900) collapses Kayenta's per-provider query UIs (Prometheus in particular has been a persistent source of user confusion) into a single template field across all canary providers, with backward compatibility for existing custom-templated configs.
* **New cloud providers.** Early-stage work on a [Proxmox provider](https://github.com/spinnaker/spinnaker/pull/7739) (caching agents already pulling VM data) and a companion [HAProxy load-balancer provider](https://github.com/spinnaker/spinnaker/pull/7822) for on-prem deployments alongside it.
