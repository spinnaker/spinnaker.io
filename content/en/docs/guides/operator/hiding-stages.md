---
title: "Hiding Stages"
linkTitle: "Hiding Stages"
weight: 2
description: >
  Stages can be hidden from end users using a property called `hiddenStages` in a custom profile for Deck.
---

Stages that are not provider-specific will be available by default. To hide specific stages
from end-users, set the `hiddenStages` property in Deck's [settings-local.js](https://github.com/spinnaker/spinnaker/blob/main/spinnaker-kustomize/overlays/config/files/settings-local.js)
to a list of the keys of stages you wish to hide. For example, to hide the Gremlin and Travis
stages, include the following in `settings-local.js`:

```js
 window.spinnakerSettings.hiddenStages = ['gremlin', 'travis'];
```
