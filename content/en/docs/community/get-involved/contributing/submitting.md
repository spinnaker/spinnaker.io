---
layout: single
title: 'Pull Requests and Changes'

aliases:
  - /docs/how-to-submit-a-pr
---

## Change Process

Once you've implemented a bug fix or feature, it's time to submit a pull request to Spinnaker. We recommend small, well-tested pull requests as a starting point for new technical contributors. For information on the correct fork-and-PR GitHub workflows to follow when contributing, reference the [local clone](/community/contributing/local-clone) guide.

To work on bigger technical changes, follow the [feature proposal](#feature-proposals) or [RFC](#requests-for-change) processes.

## Pull Request Tips

- Check that your title describes your changes and adheres to our [message conventions](#commit-and-pr-message-conventions).
- Add inline code comments to changes that might not be obvious.
- Squash your commits into logically reviewable chunks when you first submit
  your PR. Address feedback in follow-up (unsquashed) commits. It's much easier
  to review incremental changes to feedback when the commits are kept separate.
- All pull requests should get reviewed by at least one other [member of the
  Spinnaker organization](https://github.com/orgs/spinnaker/people) before
  merging. (While some members of the organization have access to merge without
  a review, this should _only_ be done in an emergency or when merging a large
  series of dependency bumps across repositories.)
- Squash your commits when merging to the branch.

## Commit and PR message conventions

Please follow conventions below in your git commit messages. Since GitHub auto-fills Pull Request titles from the first commit message of the PR, following these conventions should help to title your PRs according to our community standards.

Note: In order to track and summarize the changes happening in Spinnaker, we use a changelog automation tool called [clog](https://github.com/clog-tool/clog-cli) which scrapes information from commit messages, which follow the ['conventional'](https://github.com/conventional-changelog/conventional-changelog/blob/a5505865ff3dd710cf757f50530e73ef0ca641da/conventions/angular.md) format.

To summarize, messages should be formatted as follows:

```
<type>(<scope>): <subject>
<empty line>
<body>
<empty line>
<footer>
```

#### Type

| Type     | Purpose                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| feat     | A new feature. Please also link to the issue (in the body) if applicable. Causes a minor version bump.             |
| fix      | A bug fix. Please also link to the issue (in the body) if applicable.                                              |
| docs     | A documentation change.                                                                                            |
| style    | A code change that does not affect the meaning of the code, (e.g. indentation).                                    |
| refactor | A code change that neither fixes a bug or add a feature.                                                           |
| perf     | A code change that improves performance.                                                                           |
| test     | Adding missing tests.                                                                                              |
| chore    | Changes to build process or auxiliary tools or libraries such as documentation generation.                         |
| config   | Changes to configurations that have tangible effects on users, (e.g. renaming properties, changing defaults, etc). |

The type of keyword affects the next semantic version bump. The `feat` keyword causes a minor version bump, while the rest of the keywords cause a patch version bump. Major version bumps are triggered by the presence of the words `BREAKING CHANGE` in the _commit message body_. This is covered more in [Body](#body).

If you _don't_ use one of the previous types (or don't follow the convention), your commit will not be included in the generated changelog. Your change will still affect the next semantic version bump, but it will be considered a patch change, not a major or minor change (even if the change is a breaking change or a feature).

If you submit a pull request with multiple commits and choose to _Squash and Merge_ the pull request, the individual commit message **are not** added to the changelog, **only the pull request message is**. To include each commit in your pull request in the changelog and next version calculation, _merge the changes without squashing_.

#### Scope

The `scope` of the commit message indicates the area or feature of Spinnaker the commit applies to. For instance, if you were to submit a patch to the Google provider in Clouddriver, your commit message might look something like:

```
feat(provider/google): Updated forwarding rule schema.
```

or if you submit a fix pertaining to authentication in Gate:

```
fix(authN): Fixed session authentication coherence.
```

The `scope` is purposefully left open-ended, but try to group similar changes using the same value. Changes that have the same `scope` will be grouped together during changelog generation:

**Features**

- Some_scope
  - First feature goes here.
  - Second feature goes here.

#### Subject

The `subject` should be a short summary of the patch.

#### Body

The `body` should include any detailed information about the patch; however, these can also go in the pull request body.

#### Footer

Any information about breaking changes should be present in the footer. To signify a breaking change, add one line at the end of the commit message with 'BREAKING CHANGE' in the line:

```
feat(provider/google): Added a very important and breaking feature.

BREAKING CHANGE: More detail here if necessary.
```

At minimum, 'BREAKING CHANGE' must be specified on the last line. The extra detail is not mandatory.

### Feature Proposals

The Spinnaker community has historically avoided accepting
pull requests that add features without prior discussion. If you would like to
propose a feature:

- [Open an
  issue](https://github.com/spinnaker/spinnaker/issues/new) describing the desired functionality.
- Share your issue link in the [#dev
  channel](https://spinnakerteam.slack.com/messages/C0DPVDMQE/) in Slack.
- Consider discussing your ideas with other contributors before implementing them, to avoid rework.

### Requests For Change

If your change is large or very impactful, we may encourage you to submit an RFC:

- Use the [RFC
  template](https://github.com/spinnaker/governance/blob/master/rfc/.template.md).
- Consult several [already-submitted RFCs](https://github.com/spinnaker/governance/tree/master/rfc) for
  reference.
- When your RFC is ready, add it to [the `spinnaker/governance/rfc`
  directory](https://github.com/spinnaker/governance/tree/master/rfc) with a
  pull request. Approvers will see and review it.
