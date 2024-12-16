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

### AWS Alarms Cleanup agent support for Name RegExp's
When defining custom AWS Autoscaling policies the Alarm names might not match the predefined naming convention of the 
Alarms cleanup Agent. Users can override the default alarms pattern name `.+-v[0-9]{3}-alarm-.+` by using the following
configuration in Clouddriver profile: 

```yaml
aws:
  cleanup:
    alarms:
      enabled: true #Default to false
      daysToKeep: 90 #Default value
      alarmsNamePattern: ".+-v[0-9]{3}-CustomAlarms-.+" #Defaults to '.+-v[0-9]{3}-alarm-.+'
```
Refer to Clouddriver PR: https://github.com/spinnaker/clouddriver/pull/6317 
