---
title: 'SAML 2.0'
linkTitle: 'SAML 2.0'
mermaid: true
weight:
description: Spinnaker supports using a SAML identity provider for single sign-on authentication.
---

Security Assertion Markup Language (SAML) is an XML based way to implement single sign-on (SSO). 

A cryptographically signed XML document (known as a "SAML Assertion") is sent to the API gateway server (Gate) with 
your identifying information, such as username and group membership. 

Gate verifies the XML document's signature using a `metadata` file, and if successful, it associates the 
identifying information with the user and allows the user to proceed as authenticated.

## Identity provider setup

1. In your SAML Identity Provider (IdP), download the `metadata.xml` file. Some providers expose this as a URL which
can be used directly vs needing to download, as long as spinnaker gate can access the URL. It may look something 
like this:
    
    ```xml
    <?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <md:EntityDescriptor 
        xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"    
        entityID="https://accounts.google.com/o/saml2?idpid=SomeValueHere" 
        validUntil="2021-05-16T15:17:27.000Z">
      <md:IDPSSODescriptor 
          WantAuthnRequestsSigned="false" 
          protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:X509Data>
              <ds:X509Certificate>
    MIIDdDCCAlygAwIBAgIGAVS/Sw5yMA0GCSqGSIb3DQEBCwUAMHsxFDASBgNVBAoTC0dvb2dsZSBJ
    bmMuMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MQ8wDQYDVQQDEwZHb29nbGUxGDAWBgNVBAsTD0dv
    b2dsZSBGb3IgV29yazELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWEwHhcNMTYwNTE3
    MTUxNzI3WhcNMjEwNTE2MTUxNzI3WjB7MRQwEgYDVQQKEwtHb29nbGUgSW5jLjEWMBQGA1UEBxMN
    TW91bnRhaW4gVmlldzEPMA0GA1UEAxMGR29vZ2xlMRgwFgYDVQQLEw9Hb29nbGUgRm9yIFdvcmsx
    CzAJBgNVBAYTblVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMIIBIjANBgkqhkiG9w0BAQEF46OCAQ8A
    MIIBCgKCAQEA4JsnpS0ZBzb7DtlU7Zop7l+Kgr7NzusKWcEC6MOsFa4Dlt7jxv4ScKZ/61M5WKxd
    5YX0ol1rPokpNztj+Zk7OXrG8lDic0DpeDutc9pcq0+9/NYFF7WR7TDjh4B7Txnq7SerSB78fT8d
    4rK7Bd+cu/cBIyAAyZ5tLeLbmTnHAk093Y9vF3mdWQnfAhx4ldOfstF6G/d2ev7I5xjSKzQuH6Ew
    3bb3HLcM4uEVevOfNAlh1KoV4vQr+qzbc9UEFcPRwzuTwGa6QjfspWW7NgXKbHHC+X6a+gqJrke/
    6l2VvHaQBJ7oIyt4PCdel2cnUkvuxvzHPYedh1AgrIiSP1brSQIDAQABMA0GCSqGSI34DQEBCwUA
    A4IBAQCPqMAIau+pRDs2NZG1nGfyEMDfs0qop6FBa/wTNis75tLvay9MUlxXkTxm9aVxgggjEyc6
    XtDjpV0onrH0jBnSc+vRI1GFQ48EO3owy3uBIeR1aMy13ZwAA+KVizeoOrXBJbvIUZHo0yfKRzIu
    gtM58j58BdAFeYo+X9ds/ysvZ8FIGTLqMl/A3oO/yBNDjXR9Izoqgm7RX0JJXGL9Y1AgmEjxyqo9
    MhxZAGxOHm9HZWWfVMcoe8p62mRJ2zf4lkNPBnDHrQ8MDPSsXewAuiSnRBDLxhdBgyThT/KW7Q06
    rGa6Dp0rntKWzZE3hGQS0AdsnuFY/OXbmkNG9WUrUg5x
              </ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:SingleSignOnService 
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" 
            Location="https://accounts.google.com/o/saml2/idp?idpid=SomeValueHere"/>
        <md:SingleSignOnService 
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
            Location="https://accounts.google.com/o/saml2/idp?idpid=SomeValueHere"/>
      </md:IDPSSODescriptor>
    </md:EntityDescriptor>
    ```

2. Create a Spinnaker SAML application.
3. Specify the login URL as `https://localhost:8084/saml/SSO`. Replace "localhost" with Gate's address, if known.
4. Specify a unique entity ID (we'll use `spinnaker.test` in our example).
5. Enable the users you'd like to have access to your Spinnaker instance.
6. Generate a keystore and key in a new Java Keystore with some password:
    ```
    keytool -genkey -v -keystore saml.jks -alias saml -keyalg RSA -keysize 2048 -validity 10000
    ```


## Configure gate

Starting with Spinnaker 2025.x.x, a new SAML integration mechanism has been introduced to improve compatibility,
simplify configuration, and align with modern identity provider (IdP) standards. This replaces some of the legacy
configuration and libraries used in earlier versions of Spinnaker.

The below approach applies to certain IDPs that support signing credentials (Okta is NOT one of these). This is a
required change for keycloak and a few other providers. Note alternatively to using a custom volume map, you can
use [encryptedFile secret](https://spinnaker.io/docs/reference/secrets/) store references.

1. create configMap
```
kubectl create configmap configmap-saml --from-file=saml.jks --from-file=<your_metadata>.xml --from-file=<your_cert>.pem --from-file=<your_priv>.pem
```

2. Configure gate by adding to `gate-local.yml`

```
saml:
  enabled: true
  issuerId: <Client>
  ## Can be something LIKE https://integrator-3395767.okta.com/app/exku1rxeyhJeP16iJ697/sso/saml/metadata
  ## as an alternative to a local file copy.  Gate will then refresh on a 15 minute interval this file and
  ## at startup 
  metadataUrl: file:/opt/spinnaker/saml/<your_cert>.xml
  keyStore: file:/opt/spinnaker/saml/saml.jks
  keyStorePassword: <optional> from jks creation
  keyStoreAliasName: <optional> defaults to "mykey" when using keytool
  keyStoreType: jks (PKCS12 is new and should be used instead)
  sign-requests: true
  signing-credentials:
  - certificate-location: file:/opt/spinnaker/saml/<your_cert>.pem
    private-key-location: file:/opt/spinnaker/saml/<your_priv>.pem
```

## Network architecture and SSL termination
Please check on the [SSL Documentation](/docs/setup/other_config/security/ssl) for more information.

## Workflow
The SAML workflow below reflects the process when the user navigates to _Spinnaker first_, is redirected to the SAML 
IdP for login, and redirected back to Spinnaker. Some SAML providers will allow the user login to the _SAML provider 
first_, and click a link to be taken to Spinnaker.

### Service-Provider login flow
{{< mermaid >}}
   sequenceDiagram    
      participant Deck
      participant Gate
      participant IdentityProvider
      Deck->>+Gate: GET /auth/user and if blank redirect to auth URL
      Deck->>+Gate: GET /auth/redirect?redirect_uri=fromOriginalDeckUrl
      Gate->>-IdentityProvider: JavaScript to redirect to https://idp.url/?SAMLRequest=...
      IdentityProvider->>User: Login
      User->>IdentityProvider: Complete login
      IdentityProvider->>+Gate: POST /saml/SSO
      Gate->>+Deck: HTTP 302 to originalDeckUrl 
{{< /mermaid >}}

1. User attempts to access a protected resource by using Spinnaker.  Deck detects an empty session user and initiates the login flow

1. Gate redirects to the SAML provider, passing a few query params:
    * `SAMLRequest`: a Gzip'ed XML authentication request.
    * `SigAlg`: The algorithm used to generate the `Signature` parameter.
    * `Signature`: A digest of the `SAMLRequest` using the `SigAlg` algorithm and the server's key.

### IDP initiated flow
This is when a user logins in from their identity provider negating the need for gate to send a redirect.


    {{< mermaid >}}
        sequenceDiagram
        
        participant Deck
        participant Gate
        participant IdentityProvider
        
        User->>+IdentityProvider: User sends credentials
        IdentityProvider->>-Gate: POST /saml/SSO with { SAMLResponse: ... }
        Gate->>-Deck: HTTP 302
        Note right of Gate: User identity verified
        Note right of Gate: Gate extracts data based on userInfoMapping
        Gate->>-Deck: HTTP 302 /something/protected
       {{< /mermaid >}}
1. User logs into their provider and clicks a login button
2. A SAML response must be POSTed to `/saml/SSO`, and most browsers won't re-POST when given an HTTP 302. Instead, 
providers sometimes return a page (with HTTP 200) that has a self-submitting HTML form to POST to Gate's `/saml/SSO` 
endpoint.
3. Gate verifies the message's integrity by checking its signature, and thus verifying the user's identity information.
4. Gate determines the username and/or email address, and optionally extracts group membership (if sent by the IdP).
5. With the user's identity verified, Gate redirects the user to the originally requested URL.

## Next steps

Now that you've authenticated the user, proceed to setting up their [authorization](/docs/setup/other_config/security/authorization/).

## Troubleshooting

* Review the general [authentication guide](/docs/setup/other_config/security/authentication).
* Review the authentication [reference guide](/docs/reference/architecture/authz_authn/authentication).

* Use an [incognito window](/docs/setup/other_config/security/authentication#incognito-mode).
