---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.37

### Deploy Manifest Stage Advanced Configuration Options (Deck Support)
Deck Deploy Manifest stage support for: 
- Label Selectors (Clouddriver feature added in 1.35.x - https://github.com/spinnaker/clouddriver/pull/6220)
- skipSpecTemplateLabels option (Clouddriver feature added in 1.35.x - https://github.com/spinnaker/clouddriver/pull/6254)

To enable the Deck Advanced Configuration options in the Deploy Manifest stage set the following in `settings-local.js`
```yaml
...
  window.spinnakerSettings.feature.deployManifestStageAdvancedConfiguration=true;
...
```

Refer to Deck PRs:
- https://github.com/spinnaker/deck/pull/10152
- https://github.com/spinnaker/deck/pull/10154