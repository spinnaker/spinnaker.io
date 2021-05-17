---
title: "Security"
linkTitle: "Security"
weight: 10
description: >
  Spinnaker has multiple options for both authentication and authorization
---

Spinnaker has multiple options for both authentication and authorization. Instead of reinventing
yet-another-login system, Spinnaker hooks into a login system your organization probably already
has, such as OAuth 2.0, SAML, or LDAP.

For authorization, Spinnaker similarly leverages a role-provider that your organization may already
have set up, including Google Groups, GitHub Teams, SAML Roles, or LDAP groups.  

See also [hal config security](/docs/reference/halyard/commands/#hal-config-security).

## For reference...
[Authorization and Authentication Architecture and workflow](/docs/reference/architecture/authz_authn/)

## Next steps

Setup [authentication](./authentication/) for your Spinnaker deployment.
