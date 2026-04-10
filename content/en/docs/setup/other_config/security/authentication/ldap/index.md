---
title:  "LDAP"
description: Spinnaker supports using LDAP for authentication. 
---

Lightweight Directory Access Protocol (LDAP) is a standard way many organizations maintain user
credentials and group memberships. Spinnaker uses the standard "*bind*" approach for user
authentication. This is a fancy way of saying that Gate uses your username and password to login
to the LDAP server, and if the connection is successful, you're considered authenticated.  Note that there is a
fair bit of crossover between the authorization and authentication settings. 

### Notes

* This is mostly a spring configuration around LDAP handling.  As such, many issues may be documented on spring on configuration values for your needs.

* If the manager Domain Name (DN) is NOT set, all searches attempt to use the user currently logging in.  You'll often see errors
in the log files tied to "bind failures" and LDAP error codes.

* Escaping things like spaces is handled by the library.  You do NOT need to use LDAP escape codes to handle spaces.  

* We highly suggest the use of SSL for the LDAP connection (`ldaps://...`). Otherwise, **user passwords are passed in 
clear text over the wire.**

* Ports commonly used or referenced:
    *  636 - LDAP with SSL (`ldaps`)
    *  389 - LDAP 
    *  3268 - Active Directory (AD) Global Directory non-SSL port
    *  3269 - AD Global Directory SSL port

When a port is not specified, `ldap://host/whatever` implies port 389 by default.  `ldaps://host/whatever` uses port 636 by 
default.

## How to determine the "User DN" 

- Extract the Root DN from the `url` (`ldaps://my.server/a/b/c` → `a/b/c`)
    - If `com.netflix.spinnaker.fiat.roles.ldap.LdapUserRolesProvider` log level is at debug, you should 
    see `Root DN: <the actual root DN extracted>`
- If `userSearchFilter` is set:
    - Search LDAP:
        - Search in  `userSearchBase` OR the root (would be `a/b/c` in this example) if userSearchBase is not set.
        - Filtered by `userSearchFilter="(d={0})"` where `uid=<the username as typed in>`, such as `jdoe`.
        - Start at the rootDn and use sub tree searches
    - Return root DN computed + the found user DN
- If `userSearchFilter` is not provided:
    - Calculate the user DN using `userDnPattern`.  In the case below, the user `jdoe` would have a full DN of
    `uid=jdoe,ou=users,dc=mydomain,dc=net`.
    - Return root DN computed + user DN
    

For example, given the following parameters:

* Root DN is `dc=my-organization,dc=com` 
* `userDnPatternn` is `uid={0},ou=users`
* User with the id `jdoe`

The full, unique DN would be `uid=jdoe,ou=users,dc=my-organization,dc=com`.

When `jdoe` is trying to log in, this full user DN is constructed and passed to the LDAP server with
their password. The server hashes the password and compares it to its own hashed version. If
successful, the bind (aka connection) is successful and Gate creates a session.

## Testing with ldapsearch

In the above example, you could test with:

```bash
//Search using manager DN, manager password on url with base of "X"
# When: userSearchFilter=(uid={0}) userSearchBase=DC=USERS,OU=Y,O=io 
ldapsearch -D "MANAGER_DN" -w 'MANAGER_PASSWORD' -H ldaps://1.2.3.4 -x -b "DC=USERS,OU=Y,O=io" "(UID=USERNAME)"
```
Without a userSearchBase
```bash
//Search using manager DN, manager password on url with base of "X"
# When: userSearchFilter=(uid={0}) 
ldapsearch -D "MANAGER_DN" -w 'MANAGER_PASSWORD' -H ldaps://1.2.3.4 -x   "(UID=USERNAME})"
```
Without a userSearchFilter
```bash
//Search using manager DN, manager password on url with base of "X"
# When: --user-dn-pattern=(uid={0},ou=users) 
ldapsearch -D "MANAGER_DN" -w 'MANAGER_PASSWORD' -H ldaps://1.2.3.4/OU=Y,O=io -x "(CN=USERNAME,OU=users,OU=Y,O=IO))"
```

## Configuration 
Add the parameters to `gate-local.yml` and set as appropriate.  More information can be found below on how
these parameters impact LDAP auth.

```yaml
ldap:
  enabled: true
  url: ldaps://host/a/b/c
  managerDn: dn=bob
  managerPassword: encrypted:some:password
  groupSearchBase: groupInfo
  userDnPattern: <optional> userDnPattern
  userSearchBase: <optional> searchBase
  userSearchFilter: <optional> searchFilter
```
The [source code for the ldap configuration](https://github.com/spinnaker/spinnaker/blob/main/gate/gate-ldap/src/main/groovy/com/netflix/spinnaker/gate/security/ldap/LdapSsoConfig.groovy) in gate
can show you how this is utilized.  

## Optional configurations
You can also use `userSearchBase` (optional) and `userSearchFilterr` if the simpler
`userDnPatternn` does not match what your organization uses for `userDn`. We don't explore this
use case here, but you can read up more on LDAP search filters
[here](https://support.atlassian.com/atlassian-knowledge-base/kb/how-to-write-ldap-search-filters/).


## Active Directory

1. We recommend NOT using the `userDnPattern` argument for AD. The following issue has been reported in an issue ticket:
   
 >  userDnPattern should remain unset - AD groups store user DNs in the memberOf attribute; finding DNs from
 >  sAMAccountNames is easily doable but not with a simple, single-level pattern. The DN contains the CN, and that
 >  can’t really be constructed without sub searches. userSearchFilter takes precedence if there’s no user-dn-pattern
 >  set.

1. Here's the raw settings to add to `gate-local.yml` for active direct as an example:
```
ldap:
  enabled: true
  url:  ldaps://somethingsomething:686/ou=users,ou=company,o=com
  userSearchFilter: (&(objectClass=user)(sAMAccountName={0}))
  managerDn: CN=SVC_LDAP_USER_RO,OU=service-users,OU=company,O=com
  managerPassword: super-secret-password
```
The managerUser will then find a user in your ou=users,ou=company,o=com directory via a subtree search. You 
should be able to set the user-search-base parameter vs. including it on the URL to have it specified separately.


## Next steps

Now that you've authenticated the user, proceed to setting up their [authorization](/docs/setup/other_config/security/authorization/).

## Troubleshooting

* Review the general [authentication workflow](/docs/reference/architecture/authz_authn/authentication//#workflow).

* Use an [Incognito window](/docs/setup/other_config/security/authentication#incognito-mode). Close all Incognito windows between attempts.

* I'm getting the "Bad Credentials" exception mentioned above, but my username and password is
correct!

    Ensure that the fully qualified user DN is correct. Confirm with your LDAP administrator how
    your organization's LDAP directory is structured.
