---
title: "LDAP"
linkTitle: "LDAP"
weight: 1
description: Spinnaker supports using LDAP for authorization.
---

Please note that LDAP is flexible enough to offer lots of other options and configuration possibilities. Spinnaker
uses the Spring Security libraries, which solve a number of challenges.  


## Configure fiat

With the LDAP manager credentials and search patterns in hand, add the following to `fiat-local.yml`
```yaml
auth:
  group-membership:
    service: ldap
    ldap:
      url: ldaps://something.com
      managerDn: dn=something
      managerPassword: encrypted:secretPlease
      userSearchBase: searchBase
      groupSearchBase: ""
      ## optional, defaults to the uid={-},ou=users
      userDnPattern: uid={0},ou=users
      ## user search fitler defaults to null but could be set like so
      userSearchFilter: (employeeEmail={0})
      ## Defaults to uniqueMember={0}
      groupSearchFilter: (uniqueMember={0})
      ## defaults to cn
      groupRoleAttributes: cn
      groupUserAttributes: nullByDefault
      thresholdToUseGroupMembership: 100
      enablePagingForGroupMembershipQueries: false
      pageSizeForGroupMembershipQueries: 100
      loadUserDNsBatchSize: 100
      userIdAttribute: employeeEmail
      enableDnBasedMultiLoad: false
      cache:
        ## Defaults to false.  Enable to reduce LDAP load
        enabled: true
        expireAfterWriteSeconds: 600
```
See the [ldap configuration code](https://github.com/spinnaker/spinnaker/blob/main/fiat/fiat-ldap/src/main/java/com/netflix/spinnaker/fiat/config/LdapConfig.java) for more
information on each setting.

## How Fiat determines group membership

The LDAP provider works by querying the LDAP server utilizing a user as set by the manager-dn and manager password and
making a query that uses the logged-in user's username to filter results.

Fiat will use the "bound" account to do the following:
- Make a query using a base of `groupSearchBase`. **THIS IS A REQUIRED FIELD.** If not set, no roles get queried.
- That query uses `groupSearchFilter` to find the results.  
- This uses a parameter of the user's full DN as a filter.  This means the ONLY groups shown are those which the user is a member.
- For the groups retrieved, get the role names.  This uses the `groupRoleAttributess` attribute (defaults to `cn`).

## How to determine the "Full DN" 

- Extract the Root DN from the `url` (`ldaps://my.server/a/b/c` → `a/b/c`)
    >If `com.netflix.spinnaker.fiat.roles.ldap.LdapUserRolesProvider` log level is at debug, you should 
    see `Root DN: <the actual root DN extracted>`
- If `userSearchFilter` is provided then:
    - Search LDAP:
        - For `userSearchBase`
        - Using `userSearchFilter` aka `(uid={0})`
    - Return root DN computed + found user DN
- ELSE when `userSearchFilter` is not provided:
    - Make user DN using `userDnPattern`
    - Return root DN computed + user DN

You must provide either a search filter or a DN pattern.  In the case below, the user `joe` would have a full DN of
`uid=joe,ou=users,dc=mydomain,dc=net`.

The search would be rooted at `ou=groups,dc=mydomain,dc=net`, looking for directory entries that
include the attribute `uniqueMember=uid=joe,ou=users,dc=mydomain,dc=net`, which is the structure
for the `groupOfUniqueNames` group standard.

The `groupRoleAttributes` is how the group/role name is extracted. For example, all entries that
pass the filter will then have the `cn` (common name) attribute returned. 

> IF you want to use a username instead of a user DN for group membership, you can specify `{1}` instead of `{0}` for 
the `groupSearchFilter` parameter.  

## Source code

To see the internals (can be useful for debugging):
* Fiat: [LdapUserRolesProvider](https://github.com/spinnaker/spinnaker/blob/main/fiat/fiat-ldap/src/main/java/com/netflix/spinnaker/fiat/roles/ldap/LdapUserRolesProvider.java)
* Spring Auth Provider: [LdapAuthenticationProviderConfigurer](https://github.com/spring-projects/spring-security/blob/master/config/src/main/java/org/springframework/security/config/annotation/authentication/configurers/ldap/LdapAuthenticationProviderConfigurer.java)
* Gate: [LdapSsoConfig](https://github.com/spinnaker/spinnaker/blob/main/gate/gate-ldap/src/main/groovy/com/netflix/spinnaker/gate/security/ldap/LdapSsoConfig.groovy)
