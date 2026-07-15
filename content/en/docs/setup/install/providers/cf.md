---

title:  "Cloud Foundry"
description: Spinnaker supports deploying applications to Cloud Foundry. 
aliases: 
  - /setup/providers/cf/
---

In [Cloud Foundry](https://www.cloudfoundry.org) (CF), an Account maps to a user account on a CF foundation (a BOSH Director and all the VMs it deploys). You can add multiple accounts for one or more CF foundations.

## Prerequisites

Your CF foundations' [API endpoints](https://docs.cloudfoundry.org/running/cf-api-endpoint.html) must be reachable from your installation of Spinnaker.

## Add an account

First, make sure that the provider is enabled and add an account named `my-cf-account` to the clouddriver list of Cloud Foundry accounts:
in `~/spinnaker-kustomize/overlays/config/files/clouddriver-local.yml`

```yaml
cloudfoundry:
  enabled: true
  accounts:
    - name: my-cf-account
      api: api.sys.endpoint.for.foundation
      user: username
      password: password
      environment: whatever
      appsManagerUrl: http://apps.sys.endpoint.for.foundation
      metricsUrl: http://metrics.sys.endpoint.for.foundation
      skipSslValidation: true|false
      ## ONLY caches things spinnaker has deployed when true
      onlySpinnakerManaged: true 
```

> NOTE:
> `skipSslValidation: true` may be necessary when adding an account with a CF API endpoint using a self-signed SSL certificate or a certificate issued by an internal certificate authority. Turning this on will generate a warning.

## Next steps

Optionally, you can [set up another cloud provider](/docs/setup/install/providers/) or
continue the [installation instructions](/docs/setup/install/)
