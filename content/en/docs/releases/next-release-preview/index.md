---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.29

### Spring Boot 2.3

Spinnaker 1.29 uses spring boot 2.3, where 1.28 uses spring boot 2.2.  Spring
boot 2.3 considers session data cached by spring boot 2.2 invalid.  Therefore,
users with cached sessions will be unable to log in until the invalid
information is removed from the cache.  Open browser windows to spinnaker are
unresponsive after the deployment until they’re reloaded.  Executing:

    $ redis-cli keys "spring:session*" | xargs redis-cli del

on gate's redis instance removes the cached session information.

### Clouddriver
- Improvements to AWS EC2 instance types API integration:
The integration previously used AWS EC2 pricing docs to retrieve EC2 instance types and information. It was replaced with [AWS EC2 describe-instance-types API](https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-instance-types.html) instead. 

   Reasoning: Pricing docs precedes the API. The instance types retrieved via API are up-to-date and include other associated metadata that come in handy for Deck enhancements and improved UX. 

- Improvements to `/instanceTypes` API:
Addition of instance type metadata/ information to API response. See before-after [here](https://github.com/spinnaker/clouddriver/pull/5609).

- Changes to `/images` API: 
   - Addition of architecture type to images API (used to filter out incompatible instance types in Deck).
     [Example](https://user-images.githubusercontent.com/3614196/147272809-b1d0b865-de56-4490-b4df-677c76606281.png)
   - Images Caching [agentType](https://github.com/spinnaker/clouddriver/blob/master/clouddriver-aws/src/main/java/com/netflix/spinnaker/clouddriver/aws/provider/agent/AmazonInstanceTypeCachingAgent.java#L214) was modified to include the account information. Due to this change, your cache might still contain entries for the old cache keys ([as seen in Redis](https://github.com/spinnaker/clouddriver/pull/5609#discussion_r951929849)). These old keys will need to be cleaned up manually after upgrading to v1.29, if they are set to never expire. 
      
      example:
      old key: `com.netflix.spinnaker.clouddriver.aws.provider.AwsInfrastructureProvider:AmazonInstanceTypeCachingAgent/eu-central-1:relationships` 
      
       new key: `com.netflix.spinnaker.clouddriver.aws.provider.AwsInfrastructureProvider:AmazonInstanceTypeCachingAgent/my-aws-devel-acct/eu-central-1:relationships`
     

