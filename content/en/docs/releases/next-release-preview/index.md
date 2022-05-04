---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.28

### Clouddriver

- The sharding configuration properties used for sql based implementation are updated to make it consistent with redis based implementation. Now, the following configuration applies to both the implementations.
  ```
  cache-sharding:
    enabled: true
    replicaTtlSeconds: 60  //current timestamp plus this value makes the ttl for the pod's heartbeat record, default is 60
    heartbeatIntervalSeconds: 30 //interval to refresh heartbeat records, default is 30
  ```
- Ability to convert EC2 server groups backed by launch template to use [mixed instances policy](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#additional-features). [Here](https://spinnaker.io/docs/setup/other_config/server-group-launch-settings/aws-ec2/launch-templates/#convert-a-server-group-with-launch-template-to-use-mixed-instances-policy-with-multiple-instance-types-and-capacity-weighting) is a sample API request.
