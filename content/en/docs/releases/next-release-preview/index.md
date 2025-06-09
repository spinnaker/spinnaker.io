---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2025.1.0


#### Retrofit2 Upgrade

Retrofit1 clients from the following spinnaker services have been upgraded to retrofit2. With this release, retrofit2 upgrade of all spinnaker services is completed.
- Orca: https://github.com/spinnaker/spinnaker/pull/7085
- Kayenta: https://github.com/spinnaker/spinnaker/pull/7093
- Halyard: https://github.com/spinnaker/spinnaker/pull/7098

A new CallAdapter named LegacySignatureCallAdapter has been introduced in Kork to provide support for legacy Retrofit method signatures. This adapter enables the use of Retrofit interfaces that do not return Call<..>, similar to how Retrofit 1 worked. Both Kayenta and Halyard leveraged this feature during their Retrofit 2 upgrades, allowing them to maintain their existing method signatures without wrapping them in Call<..> or using Retrofit2SyncCall.execute()
- https://github.com/spinnaker/spinnaker/pull/7088