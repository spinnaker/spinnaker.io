---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2026.0.0

### Security fixes
We have HIGH level vulnerabilities in spinnaker tied to user input validation handling on URL calls.  Specifically, see the advisories page for more information:
https://github.com/spinnaker/spinnaker/security/advisories/
Please upgrade to a supported release as soon as possible.  

### GHA support for fiat group integration
Thanks to https://github.com/spinnaker/spinnaker/pull/7337 you can now use GitHub Apps to authentication and sync group information for fiat.  This is expected to unblock later usage of this same logic in ohter areas at a future date
but this ONLY works for FIAT for group information at this point in time.  For more information on configuration, please see [the documentation](https://spinnaker.io/docs/setup/other_config/security/authorization/github-teams/).


