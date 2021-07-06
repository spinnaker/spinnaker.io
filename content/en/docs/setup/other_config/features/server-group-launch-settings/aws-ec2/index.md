---
title:  "AWS EC2 Server Group Launch Settings"
linkTitle:  "AWS EC2 Server Group Launch Settings"
weight: 1
---

## Overview
An AWS EC2 Server Group offers a number of launch setting configurations that can enhance your experience with Spinnaker.

### Launch Settings
An AWS Server Group can be set up with either a launch template or a launch configuration. However, <b>you must enable launch templates support for all of your applications if you want to use the latest AWS features.
AWS strongly recommends using _launch templates_ over _launch configurations_ because launch configurations do NOT provide full functionality for Amazon EC2 Auto Scaling or Amazon EC2.</b>

1. (Older) [launch configuration](https://docs.aws.amazon.com/autoscaling/ec2/userguide/LaunchConfiguration.html) is an instance configuration template that an AWS Auto Scaling group uses to launch EC2 instances.
2. (Newer) [launch template](https://docs.aws.amazon.com/autoscaling/ec2/userguide/LaunchTemplates.html) is similar to a launch configuration, in that it specifies instance configuration information.
   However, defining a launch template instead of a launch configuration, you can:
   - create and maintain multiple versions of a launch template
   - access the launch-template-only AWS features like diversification of instances of a server group across instance type, purchase options (On-Demand / Spot), allocation strategies.

To learn more about launch templates features, see [AWS EC2 Launch Templates.](/features/server-group-launch-settings/aws-ec2/launch-templates.md)

### Enhance your EC2 Spot experience
[Amazon EC2 Spot Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html#spot-features) 
let you take advantage of unused EC2 capacity in the AWS Cloud. Spot Instances are available at up to a 90% discount compared to On-Demand prices. 

Spot Instances are tightly integrated with AWS services, like Amazon EC2 Auto Scaling. Auto Scaling groups let you tweak a number of configuration parameters that decide how to launch and maintain your applications running on Spot Instances.
Here are some configuration parameters to consider:
* Use MixedInstancesPolicy features detailed [here](/features/server-group-launch-settings/aws-ec2/launch-templates.md).
  For example,
   * Launch your Spot capacity from optimal instance pools using `spotAllocationStrategy` <b>caapcity-optimized</b>
   * Specify a flexible set of instance types for your server group using `launch template overrides`.
* Enable `capacityRebalance` to allow EC2 Auto Scaling to monitor and automatically respond to changes that affect availability of your Spot Instances. This feature works best with the `capacity-optimized` spotAllocationStrategy. 
  For more information about capacity rebalancing, see [Amazon EC2 Auto Scaling Capacity Rebalancing.](https://docs.aws.amazon.com/autoscaling/ec2/userguide/capacity-rebalance.html)

Learn more about [AWS recommended best practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-best-practices.html).
