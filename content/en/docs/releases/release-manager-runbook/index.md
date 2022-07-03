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

## One week before the branches are cut (Monday)

Ping [#dev](https://spinnakerteam.slack.com/messages/dev/) reminding everyone
to merge outstanding changes by Monday:

> The release manager will be cutting the $VERSION release branches next Tuesday,
> so if there are any outstanding PRs that you'd like to get into $VERSION,
> please make sure they are merged by EOD next Monday. Once the branch is cut,
> only fixes will be accepted into the release branches.

## The day the branches are cut (Tuesday)

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

1.  Create the release branches by running [`buildtool new_release_branch`](https://github.com/spinnaker/buildtool/blob/master/README.md#create-release-branches)

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

## One week after branches are cut (Monday)

1.  Audit [backport candidates](#audit-backport-candidates).

1.  FIXME: Run [buildtool integration tests](https://github.com/spinnaker/buildtool/tree/master/testing/citest) in Google Cloud Build to validate artifacts

    TODO: We may need a BOM or at least a list of artifacts to run integration
    tests with.

1.  Iterate until integration tests pass; fixing issues, tagging repositories
    and running the integration tests.

1.  Build the BOM by running [buildtool build_bom](https://github.com/spinnaker/buildtool/blob/master/README.md#build-bom)

1.  Build the Changelog by running [buildtool build_changelog](https://github.com/spinnaker/buildtool/blob/master/README.md#build-changelog)

1.  Raise a PR for Changelog at spinnaker.io by running [buildtool publish_changelog](https://github.com/spinnaker/buildtool/blob/master/README.md#publish-changelog)

1.  Add tag's to both `slim` and `ubuntu` containers - see [buildtool's release_helper.sh](https://github.com/spinnaker/buildtool/blob/master/release_helper.sh)

    1. at `{tag}` WITHOUT `unvalidated`, For example: tag `orca:1.2.3-unvalidated` with `orca:1.2.3`.
       Halyard expects container tags and debian packages to match the BOM.

    1. at `release-{major}-{minor}-{patch}` - friendly tag for use by Spinnaker
       users Kubernetes and other manifests. For example: `spinnaker-1.27.0`

1.  Upload the BOM file as `1.{minor}.{patch}` to the GCS - https://console.cloud.google.com/storage/browser/halconfig/bom

1.  Update [versions.yml](https://console.cloud.google.com/storage/browser/_details/halconfig/versions.yml)
    in place with the new version.

    1. **version** is `1.{minor}.{patch}`

    1. **alias** is `v1.{minor}.{patch}`

    1. **changelog** is the URL to the spinnaker.io changelog page you created earlier

    1. **minimumHalyardVersion** should remain unchanged unless you know of a
       reason to change it

    1. **lastUpdate** is the current Linux epoch plus `000` due to use of
       millisecond resolution for timestamps in Halyard. For example:

       ```
       $ date +%s
       1651632868

       # concatenate above with '000' becomes:
       lastUpdate=1651632868000
       ```

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

## Every subsequent Monday: Patch a previous Spinnaker version

Repeat weeklyish for each supported version.

1.  Audit [backport candidates](#audit-backport-candidates).

1.  FIXME: Rerun the `Flow_BuildAndValidate_${RELEASE}` job and get a blue build.

1.  FIXME: Run Publish_SpinnakerPatchRelease:

    1. Enter the major and minor version of the release you’re patching
       (ex: 1.18) in MAJOR_MINOR_VERSION.

    1. All other fields can be left as defaults/blank.

    This looks for a currently active release with this major and minor version.
    It copies all parameters from that release (name, changelog gist, minimum
    Halyard version), increments the patch version, and triggers
    Publish_SpinnakerRelease with these parameters. In general, this is exactly
    the behavior we want, but if you need to override this behavior (such as to
    increment the minimum Halyard version in a patch release), you can call
    Publish_SpinnakerRelease directly and pass the exact parameters that you’d
    like the new release to have.

1.  After the job has completed, run `hal version list` and verify that the
    version you just released is listed, and the prior patch release for the minor
    version is no longer listed.

1.  Go to to [Versions page]({{< ref "versions" >}}) and verify the following (leaving time for the site to rebuild):

    1. Verify the version you just released is listed.

    1. Verify the prior patch release for the minor version has been moved to the
       “Deprecated Versions” section.

    1. Verify the changelog for the new version looks correct. It should start with the
       changelog for the specific patch release, then list the changelog for each
       patch release of the minor version in reverse order.

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

1. Re-tag Halyard container without `-unvalidated`. [halyard repository](https://console.cloud.google.com/artifacts/docker/spinnaker-community/us/docker/halyard)

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
