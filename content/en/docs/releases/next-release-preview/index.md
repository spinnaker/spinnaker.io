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
- https://github.com/spinnaker/clouddriver/pull/5777 introduces a mechanism to only cache applications known to front50, by setting the following configuration flag to true.  The default is false:
    ```
    kubernetes:
      checkApplicationInFront50: true
    ```

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


### Deck
- Changes to adapt to Clouddriver API response modifications:
  - Update to types and related code: AWS image, AWS instance type
  - Improvements to validations between AWS instance type and AMI architecture (more information in #9793)

- Improvements to AWS instance selector experience ([demo](https://github.com/spinnaker/deck/pull/9793#issue-1087931624)):
  - Before, custom instance type selector displayed a huge list of 250+ instance types ([screen shot](https://user-images.githubusercontent.com/3614196/147279976-d93ac869-09bd-4a4d-a426-1b0a6117b38b.png)).
    This was replaced with:
    1. drop down now shows basic information for each instance type ([screen shot](https://user-images.githubusercontent.com/3614196/147279046-da3e959c-7922-433e-babf-75d421ab0d08.png))
    2. drop down allows filtering instance types by comma-separated list of information / metadata ([screen shot](https://user-images.githubusercontent.com/3614196/147279050-cc5837fa-0e02-4e17-b727-6b4a8baa6776.png))
        See complete list of filters [here](https://github.com/spinnaker/deck/pull/9793)
  - The instance type info is also displayed for selected instance types like [this](https://user-images.githubusercontent.com/3614196/147279050-cc5837fa-0e02-4e17-b727-6b4a8baa6776.png).


### Fiat
- https://github.com/spinnaker/fiat/pull/972 introduces a way to control whether fiat queries clouddriver during a role sync.  The default is query.  To disable querying clouddriver for applications:
    ```
    resource:
      provider:
        clouddriver:
           loadApplications: false
    ```

  The same PR also introduces another configuration property to set how frequently fiat refreshes its cache of clouddriver applications:
    ```
    resource:
      provider:
        clouddriver:
          cacheRefreshIntervalMs: <> # defaults to 30s
    ```


### Igor
- New stop API endpoint

  Reasoning: The current API endpoint `PUT /masters/{name}/jobs/{jobName}/stop/{queuedBuild}/{buildNumber}` is not working well when the job name has slashes (it happens when we have a folder structure in Jenkins).
  Instead of matching the `stop` endpoint, Spring framework is matching the request to the build API definition `/masters/{name}/jobs/**`, which is, in the end, trying to start a non-existing job. The HTTP request is matched like this because the slash character is the URI standard path delimiter, and all that goes after it counts as a new level in the path hierarchy.
    - a new endpoint has been created  (`PUT /masters/{master}/jobs/stop/{queuedBuild}/{buildNumber}`) which accepts the job name as a query parameter. See the changes [here](https://github.com/spinnaker/igor/pull/1038)


### Orca
- Changes to adapt Igor API changes:
  - Introduce a feature flag in Orca to use the new Igor `stop` endpoint. By default, if not enabled the existing endpoint (`PUT /masters/{name}/jobs/{jobName}/stop/{queuedBuild}/{buildNumber}`) will be called
    ```
    feature:
      igor:
        jobNameAsQueryParameter: true
    ```
    See the changes [here](https://github.com/spinnaker/orca/pull/4294)
