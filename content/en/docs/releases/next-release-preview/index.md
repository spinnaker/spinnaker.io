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

### GitHub organization check needs the `read:org` scope and organization approval
[#8187](https://github.com/spinnaker/spinnaker/pull/8187) changes how Gate's GitHub
`provider-requirements.organization` check looks up a user's membership. Gate used to
call the public `organizations_url` from GitHub's `/user` response
(`/users/{login}/orgs`), which only lists memberships the user has made public. It now
calls the private `GET <user-info-uri>/memberships/orgs/{org}` endpoint on behalf of
the authenticated user and requires the membership to be `active`, so users no longer
have to make their membership public.

**This breaks logins for setups that restrict access to an organization** unless both
of the following hold, otherwise GitHub denies the lookup and every user is rejected:
- The `github` client registration requests the `read:org` scope.
- The organization has approved the OAuth app, if it restricts OAuth app access.

See the [GitHub setup guide]({{< ref "docs/setup/other_config/security/authentication/oauth/github" >}}#restrict-access-to-an-organization)
for the configuration.

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

### Deck plugins now build with Vite
[#8119](https://github.com/spinnaker/spinnaker/pull/8119) moves Deck's package builds
from Rollup to Vite 7, including the build config that `@spinnaker/pluginsdk` provides
to Deck plugins. The SDK no longer ships `pluginconfig/rollup.config.js`, so an existing
plugin stops building as soon as it upgrades `@spinnaker/pluginsdk`. The SDK packages are
versioned with Spinnaker releases, so nothing in the version number warns plugin authors
about this.

The build produces the same output as before. It writes an ES module to `build/dist`
that bundles the plugin's own dependencies, and maps the libraries Deck shares with
plugins (`@spinnaker/core`, `react`, `rxjs` and so on) to the globals Deck exposes at
runtime. It still doesn't type-check the plugin or emit declaration files. Vite 7 needs
Node.js 20.19+ or 22.12+.

To migrate a plugin:

1. Upgrade the SDK packages and add `@spinnaker/scripts`, which now runs the build:
   ```shell
   pnpm add @spinnaker/pluginsdk@latest @spinnaker/pluginsdk-peerdeps@latest @spinnaker/scripts@latest
   npx check-peer-dependencies --install
   ```
2. Delete `rollup.config.js`, then run `check-plugin --fix` to restore the scaffold's
   `vite.config.js` and update the `build` and `watch` scripts:
   ```shell
   rm rollup.config.js
   npx check-plugin --fix
   ```
   Afterwards `package.json` has
   `"build": "NODE_ENV=production spinnaker-scripts build"` and
   `"watch": "spinnaker-scripts start"`, and `vite.config.js` contains:
   ```js
   module.exports = require('@spinnaker/pluginsdk/pluginconfig/vite.config');
   ```
3. Remove `rollup`, `@rollup/*` and `rollup-plugin-*` from `devDependencies`, unless your
   own code still uses them.
4. If you customised `rollup.config.js`, move the changes into `vite.config.js` by
   wrapping the SDK config. Most Rollup plugins also work as Vite plugins:
   ```js
   const pluginConfig = require('@spinnaker/pluginsdk/pluginconfig/vite.config');

   module.exports = async () => {
     const config = await pluginConfig();
     config.plugins.push(myPlugin());
     return config;
   };
   ```

### Kayenta and Deck must be upgraded together for canary query templates
[Spinnaker PR #7900](https://github.com/spinnaker/spinnaker/pull/7900) collapses the two
per-metric template fields (`customInlineTemplate` and `customFilterTemplate`) into a single
`template` field. Deck only reads `template`, while an older Kayenta only returns
`customInlineTemplate`, so existing templates will not appear in the Deck metric editor if the two
are out of step. Upgrade Kayenta and Deck together.

Kayenta still writes the template under both `template` and `customInlineTemplate`, so rolling
deploys and rollbacks keep working. Other things to be aware of:

- Reading or saving a canary config through the API now returns metrics with `template`
  populated from any `customFilterTemplate` they reference. GitOps or API consumers that diff
  the stored config against what they read back will see that addition.
- The copy is a snapshot. Once a metric has its own `template`, later edits to the shared entry in
  the config's top-level `templates` map no longer affect that metric. `customFilterTemplate` and
  the `templates` map are left in place, so nothing is lost on rollback.
- A `customFilterTemplate` that does not resolve still fails the analysis rather than falling
  back to the guided query.
- Prometheus: a template is now a complete PromQL expression and the `PromQL:` prefix is
  optional. A config that has a guided `metricName` plus a template without the prefix keeps its
  old meaning (label matchers combined with the guided fields).

### Artifact accounts that send credentials must list `allowedDomains`
[#8171](https://github.com/spinnaker/spinnaker/pull/8171) stops Clouddriver from starting
when an `http`, `gitlab`, `bitbucket` or `gitea` artifact account has credentials
(username/password, token or token file) but no `urlRestrictions.allowedDomains`. Entries
are regular expressions matched against the whole host name:
```yaml
artifacts:
  gitlab:
    accounts:
    - name: my-gitlab
      token: ...
      urlRestrictions:
        allowedDomains:
        - gitlab\.example\.com
        allowedSchemes:
        - https
```
- `github` accounts default to `github.com`, `api.github.com`, `codeload.github.com`,
  `raw.githubusercontent.com`, `media.githubusercontent.com` and
  `objects.githubusercontent.com`. GitHub Enterprise accounts must set their own hosts.
- Accounts without credentials are unaffected.
- `.*` keeps the previous behavior of not restricting hosts. Escape the dots, and only list
  hosts the credentials should be sent to.

The same change makes Echo derive a git webhook's artifacts only from its payload (an
`artifacts` key in the body is ignored), and applies the repository checks the Gitea
extractor already had to the GitHub and GitLab extractors.

[#8099](https://github.com/spinnaker/spinnaker/pull/8099) moves URL restriction checks for
Orca and Clouddriver into kork-web, with existing YAML unchanged. It fixes artifact accounts
with `urlRestrictions` rejecting every URL, and Orca's `rejectedIps` rejecting every
hostname. Resolved addresses are now checked (all of them, not just the first), so
URLs that were previously rejected by mistake may start working, and Orca gains
`allowedDomains`.

### Fiat extension resources: upgrade clients before Fiat, or use a patched release
Fiat returns resource types it doesn't model itself (such as artifact accounts, added in
[#7892](https://github.com/spinnaker/spinnaker/pull/7892)) in the `extensionResources`
of a user's permissions. Releases before the fix cannot deserialize that part of the
response, because `Authorizable` is an interface and no deserializer was registered
for it ([#8253](https://github.com/spinnaker/spinnaker/pull/8253)). **When Fiat returns an
extension resource, any service that is still on an unfixed release fails to read the
user's permissions.** Gate logins fail with a `SpinnakerConversionException` ("Cannot
construct instance of `com.netflix.spinnaker.fiat.model.resources.Authorizable`"), and
permission lookups in Clouddriver, Orca, Echo, Igor, Front50 and Keel fail the same way.

Artifact accounts are a Fiat resource by default in 2026.4.0, so this applies to every
upgrade to 2026.4.0 that doesn't deploy all services together. Plugins that register
their own Fiat resource provider can trigger the same failure on older releases.

Either:
- **Upgrade to a release that has the fix** on the 2026.3 or 2026.2 line first
  (**2026.3.2** or **2026.2.5**), then move to 2026.4.0. Do this for all Fiat clients, not
  only Gate.
- **Or upgrade one service at a time in this order:** **Gate first**, then Clouddriver,
  Orca, Echo, Igor, Front50 and Keel, and **Fiat last**.

This doesn't matter if every service is deployed together at 2026.4.0 or a fixed release.
Rolling back in any order is safe.

### Orca CI task classes renamed
[#8205](https://github.com/spinnaker/spinnaker/pull/8205) renames `StartJenkinsJobTask`,
`MonitorJenkinsJobTask`, `MonitorQueuedJenkinsJobTask` and `StopJenkinsJobTask` to
`StartBuildJobTask`, `MonitorBuildJobTask`, `MonitorQueuedBuildJobTask` and
`StopBuildJobTask`, since Jenkins, Travis, GitLab CI and Script stages all share them.
Persisted task names are unchanged, so stored and in-flight executions are unaffected.
Orca plugins that reference the old classes need updating. Failure breadcrumbs now link
to the actual build URL instead of saying "see Jenkins".

## Removals and Deprecations

### Titus, Yandex and the Stackdriver metrics push are removed
- [#8095](https://github.com/spinnaker/spinnaker/pull/8095) removes the Titus cloud provider
  across Clouddriver, Orca, Deck and Keel, including the Titus-only stages
  (`UpsertDisruptionBudget`, `UpdateJobProcesses`) and `TitusPreconfiguredJobProperties`
  from the `orca-api` plugin API.
- [#8186](https://github.com/spinnaker/spinnaker/pull/8186) removes the Yandex provider
  from Clouddriver.
- [#8107](https://github.com/spinnaker/spinnaker/pull/8107) removes `kork-stackdriver`.
  `spectator.stackdriver.enabled=true` is now silently ignored and metrics are no longer
  pushed to Stackdriver; use an OpenTelemetry agent or the observability plugin instead.
  Kayenta's Stackdriver metrics source is unaffected.
- [#8106](https://github.com/spinnaker/spinnaker/pull/8106) deletes the public
  `ProviderCacheConfiguration` class from `clouddriver-api`, now that full cache eviction
  is always on. Plugins or forks that implement it, or call the two-argument
  `NamedCacheFactory.getCache` / `SqlCache` constructor, will no longer compile.

### Canary "Guided" metric forms are deprecated
The provider-specific guided query forms (for example Prometheus `metricName`/`labelBindings`,
Stackdriver `resourceType`, Atlas `q`) and the `customInlineTemplate` / `customFilterTemplate`
fields are deprecated in favor of the single `template` field. They keep working in 2026.4.0,
2027.0 and 2027.1, and will be removed after the 2027.1.x release. There is no forced migration
before then.

## Features

### Opt-in native Amazon ECS deployments
[#8210](https://github.com/spinnaker/spinnaker/pull/8210) adds a native deployment mode to the Amazon ECS
provider. Instead of creating a new ECS service per deploy and keeping the previous ones as separate server
groups, a native deploy keeps one durable service per cluster (fixed name, tagged `spinnaker:provider=ecs-native`)
and updates it in place with the ECS deployment features: rolling or blue/green strategy, minimum/maximum healthy
percent, circuit-breaker and alarm-based rollback, bake time, and an optional pause at an ECS lifecycle hook that
new **Continue ECS Native Service Deployment** and **Stop ECS Native Service Deployment** pipeline stages act on.
The deploy stage waits for the exact ECS service deployment to succeed. Rollback picks an earlier task-definition
revision of the same service.

The mode is selected per deploy stage with the "Use native ECS deployment" checkbox; nothing changes for
existing ECS pipelines or classic server groups, and both kinds can share a cluster and target group. The account
must support ECS service tagging (long resource ID format), and the `SpinnakerManaged` role needs the ECS service
deployment APIs in addition to the classic permissions.

Things to know before switching a service: there is no in-place migration (deploy the native service next to the
classic server groups, then disable and destroy the classic ones); Disable sets the single service to a desired
count of `0`, so it stops the application rather than failing over to a sibling; Enable brings it back at the
scalable target's maximum (or `1`), the same as the classic provider does once every server group of a cluster
is disabled. Clone, terminate instances and scaling-policy edits are not supported for native server groups. See
[Amazon ECS native deployments](/docs/reference/providers/ecs-native/) and the
[account requirements](/docs/setup/install/providers/aws/aws-ecs/#native-ecs-deployments).


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

### Deployment provenance annotations
[#8100](https://github.com/spinnaker/spinnaker/pull/8100) lets Clouddriver stamp
Kubernetes resources it deploys with the Spinnaker user and pipeline execution
behind them, writing `provenance.spinnaker.io/deployed-by` and
`provenance.spinnaker.io/execution-id` to the top-level `metadata.annotations` of
each manifest. That makes it possible to answer "who deployed this, and from
which pipeline?" by looking at a live cluster, without correlating against
Spinnaker's own execution history. Both Deploy (Manifest) and Run Job stages are
covered, and the values show up under [Reserved
annotations]({{< ref "docs/reference/providers/kubernetes" >}}#provenance).

Orca resolves the user from the request that triggered the stage, falling back to
the authenticated principal recorded on the execution, and always records the
execution id. The annotations are opt-in, so no existing deployment changes
behavior until an operator enables them in `clouddriver-local.yml`:
```yaml
kubernetes:
  v2:
    apply-provenance-annotations: true
```

### Canary metrics use a single query template for every provider
[Spinnaker PR #7900](https://github.com/spinnaker/spinnaker/pull/7900) replaces the
provider-specific guided query forms in the canary config editor with one query template field,
for every Kayenta metrics provider. You write the query in your metrics provider's own syntax with
`${scope}`, `${location}` and similar variables, and each provider's starter example and variable
list is shown in the editor. Existing metrics open in whichever form matches their data, so
nothing changes for them.

This is the default for new metrics. To keep showing only the guided forms, set
`canary.templatesEnabled` to `false` in Deck's `settings.js` (`TEMPLATES_ENABLED=false` in the
stock settings file). The `canary.telemetry.query` metric gains a `queryMode` tag (`template`,
`namedTemplate` or `guided`) so you can watch adoption and failure rates. See the
[canary config docs](https://github.com/spinnaker/spinnaker/blob/main/kayenta/docs/canary-config.md)
for details.

### GitLab CI stage
[#8222](https://github.com/spinnaker/spinnaker/pull/8222) adds a `gitlabCi` stage so Orca
can trigger and monitor native GitLab CI pipelines, building on Igor's GitLab CI
trigger/cancel support and the shared CI tasks. It also fixes CI stages (Jenkins, Travis,
GitLab CI, Script) failing with `Query map was null` when started through the API without a
`parameters` field.

[#8259](https://github.com/spinnaker/spinnaker/pull/8259) makes Igor's GitLab CI trigger forward every parameter other than `ref` to GitLab
as a pipeline variable (`variables[KEY]=value`); before, only the trigger token and `ref` were
sent and the rest were silently dropped. Parameters with a null value are skipped.
[#8278](https://github.com/spinnaker/spinnaker/pull/8278) fixes reading build properties back from GitLab CI: GitLab prefixes each job-log
line with a timestamp and stream code, so `SPINNAKER_PROPERTY_*` lines never matched and the
`getBuildProperties` task failed with "Expected properties file ... missing, empty or
contained invalid syntax".

### Gitea and Forgejo artifacts and webhook triggers
[#8153](https://github.com/spinnaker/spinnaker/pull/8153) adds a `gitea/file` artifact type
(enable with `artifacts.gitea.enabled`), a `/webhooks/git/gitea` handler in Echo with
`X-Gitea-Signature` HMAC verification, and Gitea as a Git trigger repo type and artifact
editor in Deck. If neither the trigger nor the shared secret configures a secret, Gitea
events are accepted unsigned. The same change fixes GitHub webhook branch events losing
their event type after the Spring Boot 4 migration (case-sensitive header lookup).

### Deck dark theme
[#8194](https://github.com/spinnaker/spinnaker/pull/8194) adds a dark theme to Deck with
theme switching.

### Faster Deck loads and a Vite application build
[#8175](https://github.com/spinnaker/spinnaker/pull/8175) pre-compresses Deck's JavaScript
and CSS with Brotli and gzip when building the container image and serves them according
to `Accept-Encoding`; `settings*.js` stays uncompressed so runtime configuration stays
current. [#8118](https://github.com/spinnaker/spinnaker/pull/8118) moves Deck's application
build and dev server from Webpack to Vite 7, and #8121/#8124 move unit tests to Vitest and
React Testing Library.

### Branded sign-in page for basic auth and LDAP
[#8084](https://github.com/spinnaker/spinnaker/pull/8084) serves a Spinnaker-branded
sign-in page from Gate, instead of Spring Security's default form, for
`security.basicform.enabled` and `ldap.enabled`.
[#8212](https://github.com/spinnaker/spinnaker/pull/8212) makes the form post through
Gate's context path.

### Gate MCP tool allowlist and deleted-pipeline search
- [#8184](https://github.com/spinnaker/spinnaker/pull/8184) adds `mcp.server.allowed-tools`
  so operators can limit which MCP tools Gate exposes. If unset, all tools stay enabled.
- [#8027](https://github.com/spinnaker/spinnaker/pull/8027) adds an opt-in
  `includeDeletedPipelines` parameter (default `false`) to Orca's pipeline search and
  `GET /applications/{application}/pipelines`, passed through Gate and the
  `search_executions` MCP tool, to find executions of pipelines deleted from Front50. It
  has no effect when a pipeline name filter is also given.

### Fiat permissions for artifact accounts
[#7892](https://github.com/spinnaker/spinnaker/pull/7892) makes artifact accounts a Fiat
resource type (`artifact_account`), so access is authorized per user instead of open to any
authenticated caller. Artifact accounts accept `permissions`, `GET /artifacts/credentials`
is filtered by READ, fetching requires WRITE, and a denied account returns 404. Both Fiat
toggles (`auth.permissions.source.artifact-account.resource.enabled` and
`auth.permissions.provider.artifact-account`) default to enabled, so review account
permissions before upgrading.

### Kubernetes: custom resource health and faster artifact lookups
- [#8102](https://github.com/spinnaker/spinnaker/pull/8102) lets Clouddriver evaluate the
  health of custom resources (observed generation, `Stalled`/`Reconciling`/`Ready`
  conditions, `status.phase`) instead of always reporting them healthy. It is off by
  default:
  ```yaml
  kubernetes:
    customResourceStatus:
      enabled: true
  ```
- [#8045](https://github.com/spinnaker/spinnaker/pull/8045) passes label selectors to the
  `kubectl get` calls used for artifact lookups, avoiding large memory spikes in busy
  namespaces, and fixes Orca's `CleanupArtifactsTask` not passing them.
- [#8101](https://github.com/spinnaker/spinnaker/pull/8101) shows controller-written
  status text as plain text.

### Clouddriver: kubectl bundled for every supported EKS version
[#8183](https://github.com/spinnaker/spinnaker/pull/8183) packages kubectl 1.34–1.37 alongside the existing 1.31–1.33 clients in both
Clouddriver image variants (`Dockerfile.slim` and `Dockerfile.ubuntu`), covering the full
EKS 1.31–1.37 support range, and keeps 1.30.14 as an explicit compatibility option. Every
binary is verified against Kubernetes' published SHA-512 checksum. **The unversioned
`kubectl` now points at 1.36.5 (it was 1.30).** Kubernetes allows one minor version of skew
between client and server, so clusters more than one minor away from 1.36 should set the
global or per-account `kubectl` executable to a matching bundled version.

### AWS and ECS
- [#8104](https://github.com/spinnaker/spinnaker/pull/8104) adds optional
  `tcpEstablishedTimeout`, `udpStreamTimeout` and `udpTimeout` (seconds) to AWS launch
  templates, applied as the primary interface's connection tracking specification. Nitro v6
  instance types otherwise drop idle established TCP connections after 350 seconds.
- [#8048](https://github.com/spinnaker/spinnaker/pull/8048) and
  [#8049](https://github.com/spinnaker/spinnaker/pull/8049) copy ECS service monitoring
  configuration to new server groups and make it configurable in the server group wizard.
- [#8132](https://github.com/spinnaker/spinnaker/pull/8132) makes AWS bootstrapping calls
  use the account's first region.

### Stage metric tags
[#8005](https://github.com/spinnaker/spinnaker/pull/8005) lets a stage context carry an
`additionalMetricTags` map that is added to the stage's metrics, for example
`"additionalMetricTags": {"service": "foo"}`.
[#8140](https://github.com/spinnaker/spinnaker/pull/8140) adds a metric for system errors
when starting executions.

### Deck conveniences
[#8094](https://github.com/spinnaker/spinnaker/pull/8094) adds copy-to-clipboard for
artifact and image references and shows the Kubernetes load balancer FQDN.
[#8025](https://github.com/spinnaker/spinnaker/pull/8025) and
[#8156](https://github.com/spinnaker/spinnaker/pull/8156) show stored manifest references
as syntax-highlighted YAML.

### Redis-backed pub/sub (foundation)
[#8031](https://github.com/spinnaker/spinnaker/pull/8031) adds `kork-pubsub-redis`: Redis
Streams single-delivery and native Pub/Sub broadcast. It is a foundation for later work and
isn't used by default. Tests now run against Valkey 8
([#8029](https://github.com/spinnaker/spinnaker/pull/8029)).

## Major Fiat Performance Fixes

Three changes cut the cost of Fiat's per-user permission resolution and role sync. The
figures below come from the authors' local, synthetic benchmarks, not production, so treat
them as ballpark.

### Role-name checks no longer copy roles per resource
[#8093](https://github.com/spinnaker/spinnaker/pull/8093) stops `Permissions` from copying
a user's role names into a new set for every resource, which made resolving a user O(resources
× roles). With 5,000 roles per user, 17,000 accounts and applications, and 500 service
accounts, login permission resolution dropped from about 2.7 s to about 15 ms (Redis), and a
full role sync from roughly 23 minutes to 21–27 seconds. `Permissions.getAuthorizations(List<String>)`
became `getAuthorizationsForRoleNames(Set<String>)`, so code that calls it directly needs updating.

### Restricted resources are indexed by group
[#8136](https://github.com/spinnaker/spinnaker/pull/8136) builds, once per cache refresh,
an index from permission group to the restricted resources that list it, instead of scanning
every resource for every user. Service account role checks also use sets instead of list
lookups, and predicates are built lazily. In a benchmark with 17,000 applications and 200
users holding 2,000 roles each, restricted-resource lookup went from about 1.4 s to about
170 ms and service account checks from about 300–350 ms to about 25 ms.
`ServiceAccountPredicateProvider` gains a default `Set`-based overload, so existing
implementations still compile. This applies to every resource provider, including the new
artifact account provider.

### Resources are serialized once per sync and unchanged Redis writes are skipped
[#8137](https://github.com/spinnaker/spinnaker/pull/8137) serializes each resource once per
sync instead of once per user that can see it, and skips rewriting a user's Redis keys when
their content hasn't changed. It tracks this with digest keys
(`<prefix>:permissions-v2-digest:<user>:<type>`) stored beside the data. In the authors'
benchmark (1,000 users, 5,000 applications), a steady-state unchanged sync went from 115 ms
to 46 ms wall time and from 469 ms to 152 ms JVM CPU. The first sync after a deploy costs
Redis slightly more because of the digest writes.

Configuration, all under `fiat.redis.repository`:
| Property | Default | Meaning |
|---|---|---|
| `skip-unchanged-writes` | `true` | Set to `false` to rewrite every key on every put. |
| `write-digest-ttl` | unset | A positive duration expires digest keys; intended only for temporary use during a mixed-version rollout or rollback. |
| `write-digest-generation` | `"1"` | Changing it invalidates all stored digests, so the next sync rewrites everything. |

The key schema and value format are unchanged, and older Fiat versions ignore the digest
keys, so rolling back is safe. After a rollback, bump `write-digest-generation` in the same
change as the roll-forward (and once every pod runs the new version) so a same-size rewrite
by old code can't be mistaken for unchanged data.

#8093 and #8136 were also backported to the supported release branches.

## Fixes

### Clouddriver: task store reliability
- [#8130](https://github.com/spinnaker/spinnaker/pull/8130) orders SQL task state by a
  per-task sequence and makes terminal states final, fixing invisible retries, completed
  tasks that looked running, and finished tasks being reopened. It adds nullable columns,
  indexes on `tasks`, and a unique `tasks.request_id` (existing duplicates are renamed, not
  deleted). Large Postgres installs can pre-create the indexes with `CONCURRENTLY`.
- [#8172](https://github.com/spinnaker/spinnaker/pull/8172) cleans up `FAILED_RETRYABLE`
  tasks (TTL `sql.agent.task-cleanup.failed-retryable-ttl-ms`, default 7 days) and no longer
  fails a successful operation when the final progress write fails.
- [#8173](https://github.com/spinnaker/spinnaker/pull/8173) bounds the operation executor
  (`clouddriver.operations.executor.max-threads`, default 500) and answers `503` with
  `Retry-After` when full; Orca retries a 503. Installs running more than about 500
  concurrent operations per pod should raise the limit.
- [#8111](https://github.com/spinnaker/spinnaker/pull/8111) makes clouddriver-sql retries
  actually run, [#8129](https://github.com/spinnaker/spinnaker/pull/8129) persists Redis
  task saga IDs and stops task key leaks, and
  [#8110](https://github.com/spinnaker/spinnaker/pull/8110) reports an unreachable Redis
  task store as 503 instead of 500.
- [#8154](https://github.com/spinnaker/spinnaker/pull/8154) runs atomic operations with the
  caller's security context.
- [#8141](https://github.com/spinnaker/spinnaker/pull/8141) and
  [#8163](https://github.com/spinnaker/spinnaker/pull/8163) fix caching of AWS SDK v2
  timestamps and named-image enums, [#8196](https://github.com/spinnaker/spinnaker/pull/8196)
  reloads ECS account credentials when their backing AWS account changes, and
  [#8052](https://github.com/spinnaker/spinnaker/pull/8052) stores ECS on-demand timestamps
  as epoch millis.

### Fiat: GitHub App team role sync
[#8224](https://github.com/spinnaker/spinnaker/pull/8224) and
[#8229](https://github.com/spinnaker/spinnaker/pull/8229) fix Fiat dropping every user's
GitHub roles with `authMethod: GITHUB_APP`: installation tokens are now renewed and cached
memberships are kept when GitHub returns an error (only a 404 yields an empty result). New
metrics include `fiat.github.dataAgeSeconds` (the one to alert on) and
`fiat.github.fetchFailures`. An opt-in `healthCheckEnabled` (default `false`) adds the
provider to `/health`, and can hold a starting replica DOWN while GitHub is unreachable.

### Orca fixes
- [#8144](https://github.com/spinnaker/spinnaker/pull/8144) sends Clouddriver requests that
  the Retrofit2 migration left unexecuted.
- [#8174](https://github.com/spinnaker/spinnaker/pull/8174) stops a duplicate
  `StartExecution` from overwriting a newer execution status, and
  [#8211](https://github.com/spinnaker/spinnaker/pull/8211) stops sharing the `NO_TRIGGER`
  instance across executions.
- [#8135](https://github.com/spinnaker/spinnaker/pull/8135) avoids loading the full
  execution for foreign partition checks.

### Echo, Gate, Rosco and Igor
- [#8162](https://github.com/spinnaker/spinnaker/pull/8162) compares GitHub webhook
  signatures in constant time, and [#8160](https://github.com/spinnaker/spinnaker/pull/8160)
  forwards SCM webhook headers and the raw body from Gate to Echo.
- [#8235](https://github.com/spinnaker/spinnaker/pull/8235) handles null type/schema when
  Echo hydrates pipelines.
- [#8126](https://github.com/spinnaker/spinnaker/pull/8126) lets Gate's
  `JsonHttpMessageConverter` return raw JSON bodies as strings, and
  [#8134](https://github.com/spinnaker/spinnaker/pull/8134) keeps Jackson 2-only HTTP
  serialization working on Spring Boot 4 for Clouddriver, Front50, Gate, Orca and Rosco.
- [#8217](https://github.com/spinnaker/spinnaker/pull/8217) keeps Rosco polling bakes after
  an error.
- [#8105](https://github.com/spinnaker/spinnaker/pull/8105) makes Igor accept Jenkins' 303
  already-queued redirect when submitting a build.
- [#8176](https://github.com/spinnaker/spinnaker/pull/8176) names the request in kork-web's
  unhandled-error logs and logs them once, and
  [#8051](https://github.com/spinnaker/spinnaker/pull/8051) ignores Spring Boot 4
  empty-string placeholders in the plugin resolver.
- [#8181](https://github.com/spinnaker/spinnaker/pull/8181) updates image packages and
  shared Java dependencies.

### Deck fixes
- [#8213](https://github.com/spinnaker/spinnaker/pull/8213) stores manifest selector changes
  in Formik manifest stages.
- [#8202](https://github.com/spinnaker/spinnaker/pull/8202) keeps pipeline editors in sync
  with pipeline changes, and [#8128](https://github.com/spinnaker/spinnaker/pull/8128)
  reloads Run Pipeline stage parameters when switching stages.
- [#8003](https://github.com/spinnaker/spinnaker/pull/8003) hides SpEL expressions in
  execution deployment targets.

### Security: CA trust and dependency bumps
- [#8242](https://github.com/spinnaker/spinnaker/pull/8242) rebuilds the service images against current CA packages and fails the build
  if `emSign ECC Root CA - G3` is still trusted, removing that root from the JVM `cacerts`.
  Anything that relies on certificates chained to that root will stop validating.
- [#8267](https://github.com/spinnaker/spinnaker/pull/8267) bumps `netty-bom` to 4.1.137.Final (CVE-2026-75595) and
  [#8268](https://github.com/spinnaker/spinnaker/pull/8268) bumps `tomcat-embed` to 10.1.59 (CVE-2026-65182).

### More fixes
- **Fiat:** [#8261](https://github.com/spinnaker/spinnaker/pull/8261) makes `MOST_SPECIFIC` prefix permission resolution independent of
  the order of the entries in the configuration. Before, with `foo*` listed before `foo`, an
  application named exactly `foo` could be authorized with the wildcard's roles. A full
  application name now always beats a wildcard, and among wildcards the longest prefix wins.
- **Orca:** [#8208](https://github.com/spinnaker/spinnaker/pull/8208) stops `StartExecution`'s rollback from undoing a cancellation, which
  could start a pipeline that had been canceled. [#8236](https://github.com/spinnaker/spinnaker/pull/8236) reuses transaction connections
  in SQL execution persistence, cutting connection use on status updates and cancel, pause
  and resume.
- **Echo:** [#8221](https://github.com/spinnaker/spinnaker/pull/8221) keeps compensating missed cron triggers after an error (one
  unparseable cron expression used to stop it permanently), and [#8220](https://github.com/spinnaker/spinnaker/pull/8220) keeps the SQS
  subscriber running when recreating its queue fails.
- **Front50:** [#8262](https://github.com/spinnaker/spinnaker/pull/8262) fixes the plugin binary cache, which looked up a literal `key`
  and so never hit; binaries were always re-fetched from storage.
- **Kayenta:** [#8252](https://github.com/spinnaker/spinnaker/pull/8252) excludes `DataSourceAutoConfiguration` in code, so a Kayenta
  config that still uses the Spring Boot 3 class name no longer fails startup with "Failed to
  configure a DataSource". [#8282](https://github.com/spinnaker/spinnaker/pull/8282) appends a trailing slash to the GCS `rootFolder`
  prefix when deleting objects, so deleting one key can't match sibling keys sharing the prefix.
- **Google:** [#8280](https://github.com/spinnaker/spinnaker/pull/8280) makes `updateBackendService` failures actually retry (and retry
  on 500/503) instead of being swallowed and reported as success, and [#8281](https://github.com/spinnaker/spinnaker/pull/8281) keeps one
  server group that fails to build from failing the whole region's caching cycle. A skipped
  server group is evicted from the cache until a later cycle builds it.
- **Deck:** [#8263](https://github.com/spinnaker/spinnaker/pull/8263) revalidates `index.html` and `settings*.js` on reload, fixing stale
  bundles after an upgrade (such as `useDeckRuntimeServices is not a function`) that needed a
  hard refresh. [#8273](https://github.com/spinnaker/spinnaker/pull/8273) speeds up stage editors and account selectors with thousands
  of accounts, and [#8288](https://github.com/spinnaker/spinnaker/pull/8288) stops Apache gracefully on container stop, so pod
  termination no longer waits out the grace period.

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
