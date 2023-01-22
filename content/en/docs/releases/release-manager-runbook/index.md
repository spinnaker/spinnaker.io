---
title: 'Release Manager Runbook'
linkTitle: 'Release Manager'
---

## Release process overview

Here's a quick review of what the release process looks like from the community perspective:

- [This is the expected release cadence]({{< ref "release-cadence" >}}).
- The [release calendar]({{< ref "release-cadence#upcoming-releases" >}}) is awesome. It gives you an agenda with the expected duties.
- Here's what the project expects all contributors to do for [backports/patches]({{< ref "releasing#release-branch-patch-criteria" >}}).

If the builds break, you can take a look at [some common issues]({{< ref "nightly-builds#common-build-failures" >}}) to see if we've encountered them before.

## Verify you have access

If you don't have access to any of the following, contact a member of the TOC or SC.

- You're a member of the [release-managers@spinnaker.io](https://groups.google.com/a/spinnaker.io/forum/#!forum/release-managers)
  group and a _manager_ of the [spinnaker-announce@googlegroups.com](https://groups.google.com/forum/#!forum/spinnaker-announce)
  group. (You'll get a permissions error on those pages if you don't have access.
- You're a member of the [release-managers GitHub team](https://github.com/orgs/spinnaker/teams/release-managers).
- You're able to view our [GCP spinnaker-community cloudbuilds](https://console.cloud.google.com/cloud-build/builds?project=spinnaker-community). You should see a lot of builds.

## Build Artifact Table

See the GitHub Action files in each service's git repository.

| Type      | Location                                                                               | Built on merge `master` | merge `release-*` | git tag (manual + autobump) | other           |
| --------- | -------------------------------------------------------------------------------------- | ----------------------- | ----------------- | --------------------------- | --------------- |
| bom       | https://console.cloud.google.com/storage/browser/halconfig?project=spinnaker-community | N                       | N                 | N                           | Y (`buildtool`) |
| container | https://console.cloud.google.com/artifacts/docker/spinnaker-community/us/docker        | Y                       | Y                 | Y                           | N               |
| deb       | https://console.cloud.google.com/artifacts/apt/spinnaker-community/us/apt              | N                       | N                 | Y                           | N               |
| jar       | https://repo.maven.apache.org/maven2/io/spinnaker/                                     | N                       | N                 | Y                           | N               |
| spin      | https://console.cloud.google.com/storage/browser/spinnaker-artifacts/spin              | Y                       | Y                 | Y                           | N               |

## One week before the branches are cut

Ping [#dev](https://spinnakerteam.slack.com/messages/dev/) reminding everyone
to merge outstanding changes by `<DAY>`:

> The release manager will be cutting the $VERSION release branches next <DAY>,
> so if there are any outstanding PRs that you'd like to get into $VERSION,
> please make sure they are merged by EOD next <DAY - 1>. Once the branch is cut,
> only fixes will be accepted into the release branches.

## The day the branches are cut

1.  If there are any [outstanding autobump PRs](https://github.com/pulls?q=is%3Apr+author%3Aspinnakerbot+is%3Aopen),
    make the required fixes to allow them to merge. (You can ignore `keel` and
    `swabbie`; those repositories aren't part of a Spinnaker release.)

1.  Tag repositories with their respective next semVer minor version:

    1.  Tag `HEAD` of `master` in `kork` if required, merge autobump PRs.
    1.  Tag `HEAD` of `master` in `fiat` with `v{major}.{minor}.0`, merge autobump PRs.
    1.  Tag `HEAD` of `master` in `orca` with `v{major}.{minor}.0`, merge autobump PR in
        `kayenta`.
    1.  Tag `HEAD` of `master` in remaining repos with `{major}.{minor}.0`.
    1.  Don't tag `spin` repository. We'll tag after branch cut.

    The BOM will become these tags.

1.  Create the release branches by running [buildtool new_release_branch](https://github.com/spinnaker/buildtool/blob/master/README.md#create-release-branches)

    1. Create the [spin](https://github.com/spinnaker/spin) release branch at
       HEAD of `master`. Later we will tag our new branch with the Spinnaker
       Release version which creates our artifacts.

1.  Ping [#dev](https://spinnakerteam.slack.com/messages/dev/)
    with some version of this message.

    > The release branches for Spinnaker $VERSION have been cut from master!
    > Those branches are only accepting fixes for existing features. Please
    > post in this channel and tag me @$YOUR_NAME if you would like a fix
    > cherry-picked into the release.
    > If you would like to highlight a specific fix or feature in the release’s
    > changelog, please make a pull request against the
    > [curated changelog](/community/releases/next-release-preview) by Friday.

## One week after branches are cut

1.  Audit [backport candidates](#audit-backport-candidates).

1.  FIXME: Run [buildtool integration tests](https://github.com/spinnaker/buildtool/tree/master/testing/citest) in Google Cloud Build to validate artifacts

    TODO: We may need a BOM or at least a list of artifacts to run integration
    tests with.

1.  Iterate until integration tests pass; fixing issues, tagging repositories
    and running the integration tests.

1.  Ensure bumpdeps have completed and gradle versions have propagated.

1.  Run [buildtool Release GitHub Action](https://github.com/spinnaker/buildtool/actions/workflows/release.yml), with dry run `true`.

1.  Inspect job, check `Cat output files for review` step, validate BOM, changelog, and versions.yml look correct.

1.  Run [buildtool Release GitHub Action](https://github.com/spinnaker/buildtool/actions/workflows/release.yml), with dry run `false`.

1.  Update Next Release Preview.

1.  Create PR from [spinnaker.io branch](https://github.com/spinnaker/spinnaker.io/branches) (e.g. 1.2.3-changelog) created by buildtool.

1.  Seek review and merge of the [spinnaker.io docs PR](https://github.com/spinnaker/spinnaker.io/pulls) created above.

1.  Ping the [#spinnaker-releases](https://spinnakerteam.slack.com/messages/spinnaker-releases/)
    channel to let them know that a new release is available.

        > Hot Tip! You can use giphy to tell everyone it's released!
        >
        > `/giphy #caption "Spinnaker {VERSION} has been released!" gif search query`

1.  Publish a Spin CLI minor version.

    1. Each Spin CLI release is tied to a version of Gate. To ensure
       compatibility, regenerate the Gate Client API.

    1. Follow the [instructions](https://github.com/spinnaker/spin/blob/master/CONTRIBUTING.md#updating-the-gate-api)
       to update the gate client.

    1. Ensure that the GitHub Action's for the above PR merge were successful
       and then push a git tag for the release version `1.{minor}.{patch}` to
       the `spin` repository. This will kick off binary and container build &
       push to GCS and GAR.

## Patch a previous Spinnaker version

Repeat as needed for each supported version.

1.  Audit [backport candidates](#audit-backport-candidates).

1.  Ensure all branches have tags at HEAD or a suitable point.

1.  The rest of the process is almost the same as above steps for releasing a new minor version.

    Start with ensuring CI is passing on the branches, bumpdeps completed, do a GHA dry run, check output, etc.

1.  Ping the [#spinnaker-releases](https://spinnakerteam.slack.com/messages/spinnaker-releases/)
    channel to let them know that the new patch is available.

        > Hot Tip! You can use giphy to tell everyone it's released!
        >
        > `/giphy #caption "Spinnaker {VERSION} has been released!" gif search query`

1.  Approve the spinnaker-announce email (link will come in email).
    You can approve the message in the [spinnaker-announce group](https://groups.google.com/forum/#!pendingmsg/spinnaker-announce).

## Release minor-version Halyard

Repeat as needed.

1. Check for outstanding PRs.

1. Tag `master` with next `{minor}` tag. For Example `v1.45.0` next minor is
   `v1.46.0`. This will result in a new debian package at `1.46.0` and a new
   containers tagged `1.46.0-unvalidated(-ubuntu)`.

1. Create `release-{major}-{minor}-x` branch at the new tag. This enables backports and
   `{patch}` releases to be made.

1. TODO: Any validation?

1. Use [regctl](https://github.com/regclient/regclient) to add tag's to both `slim` and `ubuntu` containers. [halyard repository](https://console.cloud.google.com/artifacts/docker/spinnaker-community/us/docker/halyard)

   Example: `regctl image copy "${registry}/${service}:${tag}-unvalidated" "${registry}/${service}:${tag}"`

   1. at `{tag}` WITHOUT `unvalidated`, For example: tag `halyard:1.2.3-unvalidated` with `halyard:1.2.3`.
      Halyard expects container tags and debian packages to match the BOM.

   1. if latest stable then with `:stable` and `:stable-ubuntu`. [docs
      usage](https://spinnaker.io/docs/setup/install/halyard/#install-halyard-on-docker)

1. Post in [#halyard](https://spinnakerteam.slack.com/messages/halyard/) that a
   new version of Halyard has been released.

   > Hot Tip! You can use giphy to tell everyone it's released!
   >
   > `/giphy #caption "Halyard {VERSION} has been released!" gif search query`

## Release patch-version Halyard

Repeat as needed.

1. Ensure you have [audited](#audit-backport-candidates) all
   [Halyard backport candidates](https://github.com/spinnaker/halyard/pulls?q=is%3Apr+sort%3Aupdated-desc+label%3Abackport-candidate).

1. Tag `release-{major}-{minor}-x` branch with next `{patch}` tag. For example `v1.46.0` next
   tag is `v1.46.1`

1. TODO: Any validation?

1. Use [regctl](https://github.com/regclient/regclient) to add tag's to both `slim` and `ubuntu` containers. [halyard repository](https://console.cloud.google.com/artifacts/docker/spinnaker-community/us/docker/halyard)

   Example: `regctl image copy "${registry}/${service}:${tag}-unvalidated" "${registry}/${service}:${tag}"`

   1. at `{tag}` WITHOUT `unvalidated`, For example: tag `halyard:1.2.3-unvalidated` with `halyard:1.2.3`.
      Halyard expects container tags and debian packages to match the BOM.

   1. if latest stable then with `:stable` and `:stable-ubuntu`. [docs
      usage](https://spinnaker.io/docs/setup/install/halyard/#install-halyard-on-docker)

1. Post in [#halyard](https://spinnakerteam.slack.com/messages/halyard/) that a
   new version of Halyard has been released.

   > Hot Tip! You can use giphy to tell everyone it's released!
   >
   > `/giphy #caption "Halyard {VERSION} has been released!" gif search query`

## Publish a new version of deck-kayenta

Repeat as needed.

Follow the instructions in deck-kayenta’s
[README](https://github.com/spinnaker/deck-kayenta#publishing-spinnakerkayenta).

## Audit backport candidates

Repeat weekly.

1.  Audit each PR that has been labelled a
    [backport candidate](https://github.com/pulls?q=org%3Aspinnaker+is%3Apr+sort%3Aupdated-desc+label%3Abackport-candidate).

1.  If a candidate meets the
    [release branch patch criteria]({{> ref "releasing#release-branch-patch-criteria" >}}):

        1. Remove the `backport-candidate` label from the PR.

        1. Determine which versions the PR needs to be backported to. If it gets backported to an older version, all new versions should get the backport as well. Go only as far back as the supported [stable versions]({{< ref "versions#latest-stable" >}}).

        1. Add a comment instructing
           [Mergify](https://doc.mergify.io/commands.html#backport) to create
           backport PRs against one or more release branches. For example, to
           create backport PRs against the 1.19, 1.20 and 1.21 release branches, comment:

           > @Mergifyio backport release-1.19.x release-1.20.x release-1.21.x

        1. Approve and merge the backport PRs.

        1. If Mergify cannot create a backport because there are merge conflicts,
           ask the contributor to open a PR against the target release branches with
           their commits manually
           [cherry-picked](https://git-scm.com/docs/git-cherry-pick).

1.  If a candidate does not meet the
    [release branch patch criteria]({{< ref "releasing#release-branch-patch-criteria" >}}),
    add an explanation to the contributor as a comment.

        1. If it's impossible for the candidate to meet the criteria (for example, it doesn't
           fix a regression), remove the `backport-candidate` label.

        1. If the contributor can amend the candidate to meet the criteria (for example,
           add test coverage), don't remove the `backport-candidate` label.
