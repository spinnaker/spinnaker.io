---
title:  "GitHub Organizations"
description: Spinnaker supports OAuth 2.0 for authentication with GitHub organizations.
---

## Get Client ID and Secret

Consult the [GitHub OAuth 2.0 documentation](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/)
and [register](https://github.com/settings/applications/new) a new OAuth 2.0 application
to obtain a client ID and client secret.

**Note:** While registering the application in github, under "Authorized redirect URIs", add `https://localhost:8084/login/oauth2/code/github` (For Spinnaker below v2025.2.0, it should be `https://localhost:8084/login`)

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

### CLI

```bash
hal config security authn oauth2 edit --provider github \
  --client-id (client ID from above) \
  --client-secret (client secret from above)

hal config security authn oauth2 enable

```
