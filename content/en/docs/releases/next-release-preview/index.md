---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.2.0

### Deprecations and Removals

* **Halyard**: Halyard has been deprecated and will be removed from new publishing after this release. The current Halyard installation should continue to operate, but the code will be removed from the Spinnaker project core. Fixes can be backported as needed, but all users should migrate to an alternative installation method. Kustomize is the default documented and community-supported installation method.

* **AWS SDK v1**: AWS SDK v2 support has been introduced. AWS SDK v1 is likely to be removed in an upcoming release, though custom code using v1 should continue to operate. If you have custom implementations, it's recommended to immediately begin migrating to use the v2 integrations.

* **EDDA**: EDDA will not be supported going forward and will be removed once AWS SDK v2 is fully migrated. We have not heard of anyone in the OSS community using it and will not be continuing to support it. Please join the Spinnaker Slack if you have any concerns.

* **Spectator**: Spectator should be considered end-of-life for the project. All operations will be moving to standard Micrometer registries. While Spectator itself is a Micrometer registry, the project will be removing implementation-specific libraries.

### Major Dependency Upgrades

#### Spring Boot 3.5
A major change in this release is a full upgrade to the latest Spring Boot 3.5, moving to a supported release of Spring Boot. This means plugins will need version updates and other changes to work with the newer Spinnaker.

#### PNPM Instead of NPM
Thanks to several PRs, Spinnaker has received numerous UI version updates and moved to PNPM for publishing.

#### Gradle 8
The project has been upgraded to Gradle 8. Be aware of these changes for local builds.

### Stage Timeout Support in Webhooks
Spinnaker will now obey overridden timeouts on webhook stages.

### API Token Support

[GitHub PR #7683](https://github.com/spinnaker/spinnaker/pull/7683)

Spinnaker now has an alternative to mTLS or other API authentication mechanisms. This feature adds first-class, revocable API tokens for authenticating programmatic requests against Gate. Tokens are minted, listed, and revoked through a new self-service UI in Deck, persisted in Redis by Gate, and resolved on every inbound request by a dedicated stateless Spring Security chain.

The feature is off by default (`api-tokens.enabled=false`). Turning it on registers all of the new beans, exposes the `/auth/apiTokens` endpoints, and surfaces the "API Tokens" entry in the user menu.

#### Why API Tokens?

Today, automation that talks to Spinnaker has to either ride a user's SSO session or run as a service account behind some out-of-band auth (basic auth, mTLS, IAP-issued JWT, etc.). None of those are revocable per-credential, scoped to a single integration, or auditable from the UI.

API tokens provide:

- **Per-credential revocation**: Every token is independent; revoking one doesn't disturb other automation owned by the same user or service account.
- **Bounded lifetime**: Both user and service-account tokens have admin-tunable max lifetimes (90/365 days by default); user tokens always expire.
- **IAP-compatible transport**: `X-Spinnaker-Token: spk_…` flows cleanly through GCP IAP, which rejects non-JWT `Authorization: Bearer` values.
- **Operator observability**: A new `gate.requests` Spectator counter is tagged with `authType`, `principalKind`, `method`, `statusCode`, and `status` so operators can answer "how much of our traffic is token-auth, and from which kind of principal?" without scraping logs.


### Major ECS Performance Improvements

ECS accounts had a major performance issue where several caching agents would load all data into memory before filtering. This issue has been addressed and should drastically reduce the memory footprint for those using ECS. This should be a noticeable improvement for users with large numbers of ECS accounts.


### Microsoft Teams Integration Changes

[GitHub PR #7741](https://github.com/spinnaker/spinnaker/pull/7741)

The Microsoft Teams integration has been updated to use a set of Jinja templates to determine the Teams notification payloads. This allows a much more varied range of calls and configurations that can be sent to Microsoft Teams endpoints, and allows further updates to be done by end users without changing the codebase.

This adds two templates that can be overridden by users:
- Event notifications
- Pipeline notifications

Users can override these with a configuration option:

```yaml
microsoftteams:
  enabled: true
  templatePath: /opt/some/override/path
```

**Note**: The template files should be named `event-notification.jinja` and `pipeline-notification.jinja`. Additionally, `status` becomes a required field on pipeline notification templates (it should already always be set).

#### Migration from Outlook

For users using a deprecated/legacy endpoint, this change will send log warnings when detected. Please [read the migration guide](https://github.com/jasonmcintosh/spinnaker/blob/179e86695004fc8ec6c41ccc5b848a59a2154af1/echo/echo-notifications/src/main/resources/templates/microsoftteams/MIGRATION_GUIDE.md) for more information.

### ECS and Image Selection

ECS will now prompt you for an account when selecting an image to deploy. Additionally, some permissions issues around Docker handling have been fixed. This required some UI changes as a result. Account is now a required field on image find APIs.


