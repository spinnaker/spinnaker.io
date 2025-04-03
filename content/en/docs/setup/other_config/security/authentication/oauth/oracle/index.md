---
title:  "Oracle Cloud"
description: Spinnaker supports OAuth 2.0 for authentication with Oracle Cloud OAuth.
---

## Configuring Oracle Cloud OAuth 2.0

Consult the [Oracle Cloud Documentation](https://docs.oracle.com/en/cloud/get-started/subscriptions-cloud/ocuid/introduction-oauth-oracle-cloud.html)
to set up OAuth 2.0 and obtain a client ID and client secret.

**Note:** While registering the application in Oracle Cloud OAuth 2.0, application redirect URI that should be used is `https://localhost:8084/login/oauth2/code/oracle` (For Spinnaker v1.37.9 or below, it should be `https://localhost:8084/login`)

## Configure Halyard

You may configure Halyard either with the CLI or by manually editing the hal config.

### Hal config

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
        scope: openid,urn:opc:idm:__myscopes__ # for Spinnaker v1.37.9 or below, it should be "openid urn:opc:idm:__myscopes__" without double quotes
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

### CLI

```bash
hal config security authn oauth2 edit --provider oracle \
  --client-id (client ID from above) \
  --client-secret (client secret from above)

hal config security authn oauth2 enable

```
