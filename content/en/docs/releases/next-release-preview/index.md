---
title: 'Next Release Preview'
linkTitle: 'Next Release Preview'
weight: 2
description:
---

Please make a pull request to describe any changes you wish to highlight
in the next release of Spinnaker. These notes will be prepended to the release
changelog.

## Coming Soon in Release 2027.0.0

## Breaking Changes

### Gate session cookie properties now take effect

Gate now uses Spring Boot's session autoconfiguration to manage the `SESSION` cookie, and the
custom cookie serializers in Gate's SAML, Basic, OAuth2 and LDAP modules have been removed.
As a result, the `server.servlet.session.cookie.*` properties (`same-site`, `secure`,
`http-only`, `name`, `domain`, `path`, `max-age`, `partitioned`) are honored for every Gate
authentication flow. Previously they were ignored, or honored only for SAML.

Defaults are unchanged: the `SameSite` attribute is omitted, `HttpOnly` is enabled, and
`Secure` follows whether the request is secure. If you already set any of these properties
in `gate-local.yml` and they had no effect, review them before upgrading. To choose a SameSite
policy explicitly, for example for a cross-site SAML POST, set:

```yaml
server:
  servlet:
    session:
      cookie:
        same-site: none
        secure: true
```

## Removals and Deprecations

## Features

## Fixes
