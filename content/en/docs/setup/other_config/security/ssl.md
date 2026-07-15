---
title:  "SSL"
description: Spinnaker supports using SSL to secure communication for the UI and API.
aliases: 
  - /setup/other_config/security/authentication/ssl

---

This section covers communication with Spinnaker from parties external to your
Spinnaker instance. That is, any requests between...

* your browser and the Spinnaker UI (Deck)

* Deck and Gate (the API gateway)

* any other client and Gate

## Network configurations

**Warning**: Many operators like to get authentication working before adding
HTTPS, but experience bears out that the transition is not smooth. We recommend
you implement at least a temporary SSL solution **first**.


## Load Balancer-terminated SSL

A common practice is to offload SSL-related bits to outside of the server in
question. This is fully supported in Spinnaker, but it does affect the
authentication configuration slightly. See your [authentication
method](/docs/setup/other_config/security/authentication/) for specifics.

![SSL terminated at load balancer](/docs/setup/other_config/security/authentication/network-arch/lb-ssl-termination.png)

During certain authentication workflows, Gate makes an intelligent guess on how to assemble a URI to
itself, called the **`redirect_uri`**. Sometimes this guess is wrong when Spinnaker is deployed
in concert with other networking components, like an NGINX ingress controller, an SSL-terminating load balancer.

To manually set the URLs which spinnaker runs, you'll need to adjust a few files:
Deck's configuration for the API services in `settings.js`
```javascript
var gateHost = 'http://example.com/api/v1';
```
and the spinnaker.yaml which defines the "UI" endpoint
```yaml
services:
   ## Change to whatever domain you're using.  This enables redirect on logins post auth
   deck:
      baseUrl: http://example.com/
      enabled: true
```

Additionally, these are some recommended defaults to pass protocol and IP information downward.
Add this to your `gate-local.yml` file:

```yaml
server:
  tomcat:
    protocolHeader: X-Forwarded-Proto
    remoteIpHeader: X-Forwarded-For
    internalProxies: .*
    ## This may or may not be needed depending upon your environment.  
    ## See https://tomcat.apache.org/tomcat-9.0-doc/api/org/apache/catalina/filters/RemoteIpFilter.html
    httpsServerPort: X-Forwarded-Port

```
This is already setup by default in the [example installation repository](https://github.com/spinnaker/spinnaker/tree/main/spinnaker-kustomize)

## Server-terminated SSL

Each private key, and several other of the sensitive files generated in this doc
will have a password/passphrase.  These are the password/passphrases bash variables 
used in this doc (please substitute your own passwords/passphrases):

```bash
CA_KEY_PASSWORD=SOME_PASSWORD_FOR_CA_KEY
DECK_KEY_PASSWORD=SOME_PASSWORD_FOR_DECK_KEY
GATE_KEY_PASSWORD=SOME_PASSWORD_FOR_GATE_KEY
JKS_PASSWORD=SOME_JKS_PASSWORD
GATE_EXPORT_PASSWORD=SOME_PASSWORD_FOR_GATE_P12
```

In addition, in many of the calls below, if you want `openssl` or `keytool` to prompt
for the key rather than providing them via the CLI, you can just remove the relevant flag.

Terminating SSL within the Gate server is the de-facto way to enable SSL for
Spinnaker. This works with or without a load balancer proxying traffic to this
instance.  

![SSL terminated at server through load balancer](/docs/setup/other_config/security/authentication/network-arch/server-ssl-termination.png)

#### 1. Generate key and self-signed certificate

We will use `openssl` to generate a Certificate Authority (CA) key and a server
certificate. These instructions create a self-signed CA. You might want to
use an external CA, to minimize browser configuration, but it's not necessary
(and can be expensive).

Use the steps below to create a certificate authority. (If you're using an
external CA, skip to the next section.)

It will produce the following items:

* `ca.key`: a `pem`-formatted private key, which will have a pass phrase.
* `ca.crt`: a `pem`-formatted certificate, which (with the private key) acts as
a self-signed Certificate Authority.

1. Create the CA key.  This command below references the pass phrase environment variable used to encrypt the key `ca.key`.

    ```bash
    openssl genrsa \
      -des3 \
      -out ca.key \
      -passout pass:${CA_KEY_PASSWORD} \
      4096
    ```

1. Self-sign the CA certificate.  This command below references the pass phrase environment variable used to decrypt the key `ca.key`.

    ```bash
    openssl req \
      -new \
      -x509 \
      -days 365 \
      -key ca.key \
      -out ca.crt \
      -passin pass:${CA_KEY_PASSWORD}
    ```

#### 2. Create the server certificate(s)

If you have different DNS names for your Deck and Gate endpoints, you can either
create a certificate with a CN and/or SAN that covers both DNS names, or you can
create two certificates.  This document details creating these items, signed by
the self-signed CA cert created above:

* `deck.key`: a `pem`-formatted private key, which will have a pass phrase.
* `deck.crt`: a `pem`-formatted certificate, which (with the private key) serves
as the server certificate used by Deck.
* `gate.jks`: a Java KeyStore (JKS) that contains the following:
  * The certificate and private key for use by Gate (with alias *gate*)
  * The certificate for the Certificate Authority created above (with alias *ca*)

Additionally, these intermediate files will be created:

* `deck.csr`: a Certificate Signing Request file, generated from `deck.key` and
used in conjunction with `ca.key` to sign `deck.crt`
* `gate.csr`: a Certificate Signing Request file, generated from `gate.key` and
used in conjunction with `ca.key` to sign `gate.crt`
* `gate.crt`: a `pem`-formatted certificate for Gate.  This will be converted to
.p12 and imported into the JKS.
* `gate.p12`: a `p12`-formatted certificate and private key for Gate.  This will
be imported into the JKS.

1. Create a server key for Deck. Keep this file safe!

   This command below references the pass phrase environment variable used to encrypt the key `deck.key`.

    ```bash
    openssl genrsa \
      -des3 \
      -out deck.key \
      -passout pass:${DECK_KEY_PASSWORD} \
      4096
    ```

1. Generate a certificate signing request (CSR) for Deck. Specify `localhost` or
Deck's eventual fully-qualified domain name (FQDN) as the Common Name (CN).  

    This command below references the pass phrase environment variable used to decrypt the key `deck.key`.

    ```bash
    openssl req \
      -new \
      -key deck.key \
      -out deck.csr \
      -passin pass:${DECK_KEY_PASSWORD}
    ```

1. Use the CA to sign the server's request and create the Deck server certificate
(in `pem` format). If using an external CA, they will do this for you.  

    This command below references the pass phrase environment variable used to decrypt the key `ca.key`.

    ```bash
    openssl x509 \
      -sha 256 \
      -req \
      -days 365 \
      -in deck.csr \
      -CA ca.crt \
      -CAkey ca.key \
      -CAcreateserial \
      -out deck.crt \
      -passin pass:${CA_KEY_PASSWORD}
    ```

1. Create a server key for Gate. This command below references the pass phrase environment variable used to encrypt the key `gate.key`. Keep this file safe!

    ```bash
    openssl genrsa \
      -des3 \
      -out gate.key \
      -passout pass:${GATE_KEY_PASSWORD} \
      4096
    ```

1. Generate a certificate signing request for Gate. Specify `localhost` or Gate's
eventual fully-qualified domain name (FQDN) as the Common Name (CN).  

    This command below references the pass phrase environment variable used to decrypt the key `gate.key`.

    ```bash
    openssl req \
      -new \
      -key gate.key \
      -out gate.csr \
      -passin pass:${GATE_KEY_PASSWORD}
    ```

1. Use the CA to sign the server's request and create the Gate server certificate
(in `pem` format).  If using an external CA, they will do this for you.  

    This command below references the pass phrase environment variable used to decrypt the key `ca.key`.

    ```bash
    openssl x509 \
      -sha 256 \
      -req \
      -days 365 \
      -in gate.csr \
      -CA ca.crt \
      -CAkey ca.key \
      -CAcreateserial \
      -out gate.crt \
      -passin pass:${CA_KEY_PASSWORD}
    ```

1. Convert the `pem` format Gate server certificate into a PKCS12 (`p12`) file,
which is importable into a Java Keystore (JKS).  

    This command below references the pass phrase environment variable used to decrypt the key `gate.key`, and
    then for an import/export password to use to encrypt the `p12` file.

    ```bash
    openssl pkcs12 \
      -export \
      -clcerts \
      -in gate.crt \
      -inkey gate.key \
      -out gate.p12 \
      -name gate \
      -passin pass:${GATE_KEY_PASSWORD} \
      -password pass:${GATE_EXPORT_PASSWORD}
    ```

    This creates a p12 keystore file with your certificate imported under the alias "gate".

1. Create a new Java Keystore (JKS) containing your `p12`-formatted Gate server certificate.


    Because Gate assumes that the keystore password and the password for the key
    in the keystore are the same, we must provide both via the command line.
    This will prompt for the import/export password used to encrypt the `p12` file.

    ```bash
    keytool -importkeystore \
      -srckeystore gate.p12 \
      -srcstoretype pkcs12 \
      -srcalias gate \
      -destkeystore gate.jks \
      -destalias gate \
      -deststoretype pkcs12 \
      -deststorepass ${JKS_PASSWORD} \
      -destkeypass ${JKS_PASSWORD} \
      -srcstorepass ${GATE_EXPORT_PASSWORD}
    ```

1. Import the CA certificate into the Java Keystore.  
    
    This will prompt for a password to encrypt the Keystore file.

    ```bash
    keytool -importcert \
      -keystore gate.jks \
      -alias ca \
      -file ca.crt \
      -storepass ${JKS_PASSWORD} \
      -noprompt
    ```

1. Verify the Java Keystore contains the correct contents.

    ```bash
    keytool \
      -list \
      -keystore gate.jks \
      -storepass ${JKS_PASSWORD}
    ```

    It should contain two entries:

    * `gate` as a `PrivateKeyEntry`
    * `ca` as a `trustedCertEntry`

Voilà! You now have a Java Keystore with your certificate authority and server
certificate ready to be used by Spinnaker Gate, and, separately, a pem-formatted
key and server certificate ready to be used by Spinnaker Deck!

#### 3. Configure SSL for Gate and Deck

With the above certificates and keys in hand, you can setup SSL
for [Gate and Deck](/docs/reference/architecture/).

For Gate, add the following to the `gate-local.yml`
```yaml
server:
  ssl:
    enabled: true
    crlFile: <optional>
    key-store: <reference to [service].p12>
    key-store-type: PKCS12
    key-store-password: <[SERVICE]_KEY_PASS>
```

For Deck, you'll want to adjust the deck apache configuration to set the cert information.  This file
should be mounted to `/etc/apache2/sites-enabled/spinnaker.conf` on the deck pod.
```
<VirtualHost 0.0.0.0:9000>
 <IfModule ssl_module>
      SSLEngine on
      SSLCertificateFile "/opt/spinnaker/config/ssl/deck.crt"
      SSLCertificateKeyFile "/opt/spinnaker/config/ssl/deck.key" 
  </IfModule>

  DocumentRoot /opt/deck/html
  <Directory "/opt/deck/html/">
     Require all granted
  </Directory>
</VirtualHost>
```
Make sure the certs are stored in a secret volume that is mounted into the `/opt/spinnaker/config/ssl` folder.  Deck
does NOT support encrypted secrets as it is a plain apache2 server, and as such, you can configure additional settings
as needed.  You can mount these in other locations as needed.  The above 

## Verify your SSL setup

To verify that you've successfully set up SSL, try to reach one of the
endpoints, like Gate or Deck, over SSL.

## Troubleshooting

If you have problems...

* Are you using https?
* Do you have certs correct?
* Try curl or openssl commands against services to validate your certificate chain


## Using a custom CA for internal communications
There are a lot of places in Spinnaker which support the ability to configure custom Java trust/key stores for 
organizations who use internally signed certificates. In some cases, however, this isn’t supported yet but you still 
need to talk to a service which serves one of these certificates. This section will show you how to import your 
certificate into a Java trust/key store and configure a Spinnaker service with it.

Create a temporary copy of your system’s Java trust/key store and import your internal certificate. If you’re on a Mac,
this will be located at `/usr/libexec/java_home/)/jre/lib/security/cacerts`. It will be different on Linux.
```
mkdir /tmp/custom-trust-store`
cp {path-to-cacerts} /tmp/custom-trust-store
keytool import -alias custom-ca -keystore /tmp/custom-trust-store/cacerts -file {your-internal-certificate}
```

```bash
kubectl create secret generic -n {your-spinnaker-namespace} internal-trust-store \
   --from-file=cacerts=/tmp/custom-trust-store/cacerts
```
Configure a Spinnaker service with the new trust/key store using a volume mount.  Mount the cacerts file
into a secret that's then mounted to replace the operating system cacerts.   This would be the file:
`/etc/ssl/certs/java/cacerts` by default.

The Spinnaker component for which you configured the `cacerts` file should now be using the 
new trust/key store by default.

## Next steps

Choose an [authentication method](/docs/setup/other_config/security/authentication/).