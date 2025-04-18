---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.38

### echo

Version 1.31.0 of Spinnaker introduced a feature to [filter pipelines from front50](https://spinnaker.io/changelogs/1.31.0-changelog/#echo), that was disabled by default.  Version 1.35.0 [enabled it by default](https://spinnaker.io/changelogs/1.35.0-changelog/#changelog), but we've had enough trouble with it, that https://github.com/spinnaker/echo/pull/1503 disables it by default again.

### retrofit2 upgrade

All retrofit clients are upgraded to retrofit2 and any references to retrofit1 dependencies are removed in the following services.
- Igor - https://github.com/spinnaker/igor/pull/1313
