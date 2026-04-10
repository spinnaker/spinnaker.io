---
title:  "Oracle Cloud"
description: Spinnaker supports OAuth 2.0 for authentication with Oracle Cloud OAuth.
---

## Configuring Oracle Cloud OAuth 2.0

Consult the [Oracle Cloud Documentation](https://docs.oracle.com/en/cloud/get-started/subscriptions-cloud/ocuid/introduction-oauth-oracle-cloud.html)
to set up OAuth 2.0 and obtain a client ID and client secret.

**Note:** While registering the application in Oracle Cloud OAuth 2.0, application redirect URI that should be used is
`https://localhost:8084/login/oauth2/code/oracle` (For Spinnaker below v2025.2.0, it should be
`https://localhost:8084/login`)

## Configure Gate
Add the following to `gate-local.yml`
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          userInfoMapping:
            email: ''
            firstName: given_name
            lastName: family_name
            username: preferred_username
          oracle:
            client-secret: <client-secret>
            scope: openid,urn:opc:idm:__myscopes__
            client-id: <client-id>
            redirect-uri: https://<your-domain>/login/oauth2/code/<providerid-aka-google>
        provider:
          oracle:
            user-info-uri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/userinfo
            authorization-uri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/authorize
            token-uri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/token
```

### For versions prior to 2025.2.0
Add the following to `gate-local.yml` 

```yaml
security:
  authn:
    oauth2:
      enabled: true
      client:
        clientId: # client ID from above
        clientSecret: # client secret from above
        accessTokenUri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/token
        userAuthorizationUri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/authorize
        scope: openid urn:opc:idm:__myscopes__
      resource:
        userInfoUri: https://idcs-${idcsTenantId}.identity.oraclecloud.com/oauth2/v1/userinfo
      # You may want to restrict access to your Spinnaker by adding
      # userInfoRequirements to further restrict access beyond simply requiring
      # that users have a valid account.
      userInfoRequirements: {}
      userInfoMapping:
        email: ''
        firstName: given_name
        lastName: family_name
        username: preferred_username
      provider: ORACLE
```