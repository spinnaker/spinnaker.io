---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 1.36

### Enhanced pipeline batch update feature

Batch update operation is now atomic. Deserialization issues are addressed. 

Configurable controls are added to decide whether cache should be refreshed while checking for duplicate pipelines:
```yaml
controller:
   pipeline:
      save:
         refreshCacheOnDuplicatesCheck: false // default is true 
```

Batch update call now responds with a status of succeeded and failed pipelines info. The response will be a map containing information in the following format:

``` 
[
    "successful_pipelines_count"  : <int>,
    "successful_pipelines"        : <List<String>>,
    "failed_pipelines_count"      : <int>,
    "failed_pipelines"            : <List<Map<String, Object>>> 
]
```
Here the value for `successful_pipelines` is the list of successful pipeline names whereas the value for `failed_pipelines` is the list of failed pipelines expressed as maps. 

### Manual installation of awscliv2 and aws-iam-authenticator for Debian packages

As of https://github.com/spinnaker/clouddriver/pull/6278, awscliv2 and aws-iam-authenticator are no longer included in clouddriver Debian packages.  To install them manually:

```bash
AWS_CLI_VERSION=2.15.22
curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-${AWS_CLI_VERSION}.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install --update
rm -rf ./awscliv2.zip ./aws

AWS_AIM_AUTHENTICATOR_VERSION=0.6.14
curl -s "https://github.com/kubernetes-sigs/aws-iam-authenticator/releases/download/v${AWS_AIM_AUTHENTICATOR_VERSION}/aws-iam-authenticator_${AWS_AIM_AUTHENTICATOR_VERSION}_linux_amd64" -o aws-iam-authenticator
chmod +x ./aws-iam-authenticator
mv ./aws-iam-authenticator /usr/local/bin/aws-iam-authenticator
```