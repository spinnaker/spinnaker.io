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

### Spring Security 5 Oauth2 Migration

<<<<<<< HEAD

#### Retrofit2 Upgrade
=======
https://github.com/spinnaker/spinnaker/pull/7052 removes deprecated OAuth2 annotations, and uses Spring Security 5's DSL.  As a result, the properties for configuring oauth2 in gate have changed.
>>>>>>> b91c947110d05c1667e1934682380e74bd84b0d0

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

<<<<<<< HEAD
A new CallAdapter named LegacySignatureCallAdapter has been introduced in Kork to provide support for legacy Retrofit method signatures. This adapter enables the use of Retrofit interfaces that do not return Call<..>, similar to how Retrofit 1 worked. Both Kayenta and Halyard leveraged this feature during their Retrofit 2 upgrades, allowing them to maintain their existing method signatures without wrapping them in Call<..> or using Retrofit2SyncCall.execute()
- https://github.com/spinnaker/spinnaker/pull/7088

All retrofit clients are upgraded to retrofit2 and any references to retrofit1 dependencies are removed in the following services.
- Igor - https://github.com/spinnaker/igor/pull/1313

### spring security 5 oauth2 migration in gate
Remove deprecated OAuth2 annotation. Instead Use Java DSL way of OAuth2
- gate - https://github.com/spinnaker/gate/pull/1887
Migrated OAuth2 configuration to align with Spring Security 5 Java DSL standards
- halyard - https://github.com/spinnaker/halyard/pull/2216
Update Spinnaker documentation for OAuth2 property changes in Spring Security 5
- spinnaker.io - https://github.com/spinnaker/spinnaker.io/pull/503
=======
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
>>>>>>> b91c947110d05c1667e1934682380e74bd84b0d0
