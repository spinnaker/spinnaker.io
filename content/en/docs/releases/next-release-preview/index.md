---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.33

### Deck

- https://github.com/spinnaker/deck/pull/10036 adds support to deploy different versions of artifacts based on the target cluster API and Kubernetes version, significantly improving the user experience when deploying Helm charts.
- To enable this feature, you must set `API_VERSIONS_ENABLED` to `true` in Deck.

  For configuration, see [Deploy Helm Charts]({{< ref "docs/guides/user/kubernetes-v2/deploy-helm" >}}).

Other related PRs are:
https://github.com/spinnaker/orca/pull/4546
https://github.com/spinnaker/rosco/pull/1020