To make the dynamic timeout available you need to enable the feature flag in:

### Orca
 by addig in the Orca config:

```
rollback:
  timeout:
    enabled: true
```

### Deck
  by adding in the Deck config:

`window.spinnakerSettings.feature.dynamicRollbackTimeout = true;`

Without the feature flag enabled in both Orca and Deck the default value is 5 minute
