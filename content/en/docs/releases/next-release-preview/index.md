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

### Gate

#### Spring Security 5 Oauth2 Migration

https://github.com/spinnaker/spinnaker/pull/7052 removes deprecated OAuth2 annotations, and uses Spring Security 5's DSL.  As a result, the properties for configuring oauth2 in gate have changed.

old:
```
security:
  authn:
    oauth2:
      enabled: true
      client:
        clientId: <client-id>
        clientSecret: <client-secret>
        accessTokenUri: https://www.googleapis.com/oauth2/v4/token
        userAuthorizationUri: https://accounts.google.com/o/oauth2/v2/auth
        scope: profile email
      userInfoRequirements:
        hd: <domain>
      resource:
        userInfoUri: https://www.googleapis.com/oauth2/v3/userinfo
      userInfoMapping:
        email: email
        firstName: given_name
        lastName: family_name
      provider: GOOGLE
```

new (google):
```
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: <client-id>
            client-secret: <client-secret>
            authorization-grant-type: authorization_code
            redirect-uri: "https://<your-domain>/login/oauth2/code/google"
            scope: profile,email,openid
            client-name: google
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            user-name-attribute: sub
```

new (github):
```
spring:
  security:
    oauth2:
      client:
        registration:
          userInfoMapping:
            email: email
            firstName: ''
            lastName: name
            username: login
          github:
            client-id: <client-id>
            client-secret: <client-secret>
            authorization-grant-type: authorization_code
            redirect-uri: "https://<your-domain>/login/oauth2/code/github"
            scope: user,email
            client-name: github
        provider:
          github:
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
            user-name-attribute: login
```

halyard has been updated to generate the new configuration, with the same command as before, e.g.:
```
hal config security authn oauth2 edit --provider google --client-id some_id --client-secret some_secret --user-info-requirements hd=company.io
```
