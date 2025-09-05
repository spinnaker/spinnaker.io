---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2025.2.0

### Clouddriver

https://github.com/spinnaker/spinnaker/pull/7239 and https://github.com/spinnaker/spinnaker/pull/7240 add functionality to log the endpoints that the AWS sdk uses, controlled by two new config flags that default to false:
```yaml
aws:
  client:
    logEndpoints: true
```
and
```yaml
artifacts:
  s3:
    logEndpoints: true
```

`aws.client.logEndpoints` is for clients that AmazonClientBuilder creates, as well as NetflixSTSAssumeRoleSessionCredentialsProvider.  `artifacts.s3.logEndpoints` is for clients that S3ArtifactCredentials creates.

Note: https://github.com/spinnaker/spinnaker/pull/7240 changes constructors in AmazonCredentials / AssumeRoleAmazonCredentials / NetflixAmazonCredentials / NetflixAssumeRoleAmazonCredentials.  Plugins or custom code may need corresponding changes (e.g. pass null for AwsConfigurationProperties) to continue to build.
