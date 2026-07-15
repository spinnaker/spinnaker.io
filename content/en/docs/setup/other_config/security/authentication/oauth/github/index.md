---
title:  "GitHub Organizations"
description: Spinnaker supports OAuth 2.0 for authentication with GitHub organizations.
---

# WARNING

IF YOU ARE NOT CAREFUL you can configure spinnaker to allow ANY github user, not just the ones
in your organization access to spinnaker.  As such, please make sure to set the restrictions as appropriate
for your org!  Specifically `spring.security.oauth2.client.registration.github.provider-requirements` restriction
to limit access to a specific github org!  Failure to set this places your spinnaker installation at risk
of unintended access! For this to work, your users MUST be public members to validate their membership in the github organization.

It's recommended to use something like keycloak to terminate and control access and federate access than
directly using github authentication via spinnaker.  OR an alternative SSO provider!


## Setup
### Get Client ID and Secret

Consult the [GitHub OAuth 2.0 documentation](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/)
and [register](https://github.com/settings/applications/new) a new OAuth 2.0 application
to obtain a client ID and client secret.

**Note:** While registering the application in github, under "Authorized redirect URIs", add
`https://localhost:8084/login/oauth2/code/github` (For Spinnaker below v2025.2.0, it should be
`https://localhost:8084/login`)

### Configure Gate

Add to `gate-local.yml` the following configuration
```yaml
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
            client-secret: client-secret
            scope: user,email
            client-id: client-id
        provider:
          github:
            user-info-uri: https://api.github.com/user
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
```

### For spinnaker before 2025.2.0
For older versions of spinnaker you'd have this configuration in `gate-local.yml`:
```yaml
security:
  authn:
    oauth2:
      enabled: true
      client:
        clientId: # client ID from above
        clientSecret: # client secret from above
        accessTokenUri: https://github.com/login/oauth/access_token
        userAuthorizationUri: https://github.com/login/oauth/authorize
        scope: user,email # for Spinnaker below v2025.2.0, it should be "user:email" without double quotes
      resource:
        userInfoUri: https://api.github.com/user
      # You almost certainly want to restrict access to your Spinnaker by adding
      # userInfoRequirements; otherwise any user with a GitHub account will be
      # able to access it.
      userInfoRequirements: {}
      userInfoMapping:
        email: email
        firstName: ''
        lastName: name
        username: login
      provider: GITHUB
```