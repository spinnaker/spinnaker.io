---
title:  "Azure"
description: Spinnaker supports OAuth 2.0 for authentication with Azure.
---

This page instructs you on how to obtain an OAuth 2.0 client ID and client secret for
use with your Microsoft Azure tenant. More extensive documentation is available on
[Microsoft's site](https://learn.microsoft.com/en-us/azure/active-directory-b2c/client-credentials-grant-flow?pivots=b2c-user-flow).

## Setting up an Azure Application Registration

1. Navigate to [https://portal.azure.com](https://portal.azure.com) and log in with your Azure credentials.
2. On the left hand navigation pane, click "Azure Active Directory" --> "App registrations".
3. Click "New application registration", and fill in the details:
   - Name of the application: (eg Spinnaker),
   - Application type: Web app / API
   - Sign-on URL: `https://localhost:8084/login/oauth2/code/azure`  (replace localhost with your Gate address if known, and `https` with `http` if appropriate). For Spinnaker below v2025.2.0, it should be just `https://localhost:8084/login`
   - Click "Create"
4. Note the "Application ID", this is the client ID. Copy it to a safe place.
5. Click "Settings" -> "Keys". Under "Passwords", add a Key Description (eg Spinnaker), set the expiry and then click "Save".
   "Value" will now be populated. This is your client secret; copy it to a safe place.

## Configure Gate
### Current configurations 

Add the following to `gate-local.yml`. Note the Tenant ID of your organization is required for Azure OAuth 2.0 login. To
obtain it:

1. Navigate to [https://portal.azure.com](https://portal.azure.com) and log in with your Azure credentials.
2. On the left hand navigation pane, click "Azure Active Directory" --> "Properties".
3. "Directory ID" is your Tenant ID.

In order to pass the Tenant ID to gate, set it in the `issuer-uri` below

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          azure:
            client-id: ${AZURE_CLIENT_ID}
            client-secret: ${AZURE_CLIENT_SECRET}
            scope: openid, profile, email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/azure"
        provider:
          azure:
            issuer-uri: https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0
```


### For old versions of spinnaker, these would be added to `gate-local.yml`.  These no longer work as of 2025.2.0
REMINDER:  These configuration properties are no longer used in current releases.  See
the [2025.2.0 release notes](https://spinnaker.io/changelogs/2025.2.0-changelog/) for information on migrating
to a current configuration like the above example

```yaml
security:
  authn:
    oauth2:
      enabled: true
      client:
        clientId: # client ID from above
        clientSecret: # client secret from above
        accessTokenUri: https://login.microsoftonline.com/${azureTenantId}/v2.0/oauth2/token
        userAuthorizationUri: https://login.microsoftonline.com/${azureTenantId}/v2.0/oauth2/authorize
        clientAuthenticationScheme: query
        scope: profile
      # You may want to restrict access to your Spinnaker by adding
      # userInfoRequirements to further restrict access beyond beyond simply
      # requiring that users have a valid account in your Azure AD Tenant.
      userInfoRequirements: {}
      resource:
        userInfoUri: https://graph.windows.net/v1.0/me
      userInfoMapping:
        email: userPrincipalName
        firstName: givenName
        lastName: surname
      provider: AZURE
```