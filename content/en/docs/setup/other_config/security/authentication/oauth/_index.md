---
title:  "OAuth 2.0"
description: Use OAuth 2.0 to authenticate users and grant them access to Spinnaker.
---

OAuth 2.0 is the preferred way to authenticate and authorize third parties access to your data guarded by the identity
provider. To confirm your identity, Spinnaker requests access to your email address from your identity provider. Please
read ALL of the documentation on this page as just setting the provider may not work for your environment.

## Configuration

Spinnaker has moved to spring security standard DSL for configuration oauth2.  You can find these 
[configuration parameters in the spring documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html#oauth2-client-log-users-in)
around client registry properties. The following needs to be set in your  `gate-local.yml` configuration
file according to the expected configuration for your provider.  An example using Google:
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          userInfoMapping:
            email: email
            firstName: given_name
            lastName: family_name
          userInfoRequirements:
            hd: <domain>
          google:
            client-secret: <client-secret>
            scope: profile,email
            client-id: <client-id>
            redirect-uri: https://<your-domain>/login/oauth2/code/<providerid-aka-google>
        provider:
          google:
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://www.googleapis.com/oauth2/v4/token
```

Note that `userInfoRequirements` is a spinnaker specific implementation.  See information below [on configuration user info requirements](#restricting-access-based-on-user-info)

## OAuth 2.0 providers
Consult the documentation of your OAuth 2 provider to determine the appropriate
values to put in each configurable field. For some common OAuth 2.0 providers,
specific documentation is provided here.

If you're using one of these providers, please follow the appropriate link
below for specific instructions on configuring your provider:
* [Azure](./azure/)
* [GitHub Organization](./github/)
* [Google Apps for Work / G Suite](./google/)
* [Oracle Cloud](./oracle/)

## Network architecture and SSL termination

During the OAuth [workflow](/docs/reference/architecture/authz_authn/authentication/#workflow), Gate makes an intelligent
guess on how to assemble a URI to
itself, called the *redirect URI*. Sometimes this guess is wrong when Spinnaker is deployed
in concert with other networking components, such as an SSL-terminating load balancer, or in the
case of the [Quickstart](/docs/setup/quickstart) images, a fronting Apache instance.

You can manually set the redirect URI at the `spring.security.oauth2.client.registration.<provider>.redirect-uri` parameter as documented
above.

### Old spinnaker versions
Though no longer supported, for Spinnaker below v2025.2.0 configuration would be set in `gate-local.yml` similar to:
```yaml
security:
  authn:
    oauth2:
      client:
        preEstablishedRedirectUri: https://my-real-gate-address.com:8084/login
```
> Be sure to include the `/login` suffix at the end of the of your `preEstablishedRedirectUri`!.

Additionally, some configurations make it necessary to "unwind" external proxy instances. This makes the request to Gate
look like the original request to the outer-most proxy. Add this to your `gate-local.yml` file.

```
server:
  tomcat:
    protocolHeader: X-Forwarded-Proto
    remoteIpHeader: X-Forwarded-For
    internalProxies: .*
```

## UserInfoMapping

The `userInfoMapping` field in the configuration is used to map the names of fields from the
`userInfoUri` request to Spinnaker-specific fields. For example, if your user profile in your OAuth 2.0
 provider's system looks like:

```json
{
  "user": "fmercury",
  "mail": "fmercury@queen.com",
  "fName": "Freddie",
  "lName": "Mercury"
}
```

Then your `userInfoMapping` should look like:
```yaml
userInfoMapping:
  email: mail
  firstName: fName
  lastName: lName
  username: user
```

## Restricting access based on User Info

User access can be restricted further based on the user info from an OAuth ID token. This
requirement is set via the `userInfoRequirements` property.  THis is a map
of key/value pairs. The values are interpreted as regular expressions if they
start and end with '/'. This enables restricting login to users from a specific domain
or having a specific attribute.

For example:
```yaml
security:
  authn:
    oauth2:
      userInfoRequirements:
        hd: your-org.net
        batz: /^Sample.*Regex/
        foo: bar
```

## Next steps

Now that you've authenticated the user, proceed to setting up their [authorization](/docs/setup/other_config/security/authorization/).

## Troubleshooting

* Review the general [authentication workflow](/docs/reference/architecture/authz_authn/authentication/#workflow).

* Use an [incognito window](/docs/setup/other_config/security/authentication#incognito-mode).

* I'm getting an `Error: redirect_uri_mismatch` from my OAuth provider.

    The full error may look something like:

    > Error: redirect_uri_mismatch. The redirect URI in the request, https://some.url/login,
    does not match the ones authorized for the OAuth client.

    This likely means you've not set up your OAuth credentials correctly. Ensure that the Authorized
    Request URIs list contains `https://my-gate-address/login/oauth2/code/<provider>` (no trailing /). `provider` should be one among `azure`,`github`,`google`,`oracle`,`other`
    For Spinnaker below v2025.2.0, it should be `https://my-gate-address/login`
