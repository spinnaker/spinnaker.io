---

title:  "Jenkins"
sidebar:
  nav: setup
aliases: 
    - /docs/jenkins-script-execution-stage
---



Setting up [Jenkins](https://jenkins.io/) as a Continuous
Integration (CI) system within Spinnaker lets you trigger pipelines with
Jenkins, add a Jenkins stage to your pipeline, or add a Script stage to your
pipeline.

## Prerequisites

To connect Jenkins to Spinnaker, you need:

*   A running Jenkins Master at version 2.x, reachable at a URL
    (`$BASEURL`) from where Spinnaker runs.
*   A username/API key (`$USERNAME`/`$APIKEY`) pair able to authenticate
    against Jenkins using HTTP Basic Auth, if Jenkins is secured. A user's
    API key can be found at `$BASEURL/user/$USERNAME/configure`.

## Add your Jenkins master

Add the following to `igor-local.yml` to enable Jenkins;
```yaml
jenkins:
  enabled: true
  masters:
    - name: my-jenkins-server
      address: https://my.jenkins.example.com/jenkins
      username: encrypted:secret
      csrf: false
      jsonPath: <OPTIONAL> when using google auth
      oauthScopes:
        - when using google auth
      token: encrypted:secret:ideally
      itemUpperThreshold: <OPTIONAL> maxItemsToProcessPerPollCycle
      trustStore: <OPTIONAL> whenUsingCustomCerts
      trustStoreType: <OPTIONAL> JKS or PKCS12
      trustStorePassword: <OPTIONAL> if needed, native is changeit
      keyStore: <OPTIONAL> If using MTLS
      keyStoreType: <OPTIONAL> PKCS12 or JKS
      keyStorePassword: <OPTIONAL>
      skipHostnameVerification: toSkipTLSValidation
      ciEnabled: defaultsTOFalse
      permissions:
        READ:
          - groupName
        WRITE:
          - groupName
```
It is recommended to use [encrypted secrets](/docs/reference/secrets/) for password information in the above

> *Note*: If you use the [GitHub OAuth
> plugin](https://wiki.jenkins.io/display/JENKINS/GitHub+OAuth+Plugin)
> for authentication into Jenkins, you can use the GitHub $USERNAME, and use the
> OAuth token as the $APIKEY.


## Configure Jenkins and Spinnaker for CSRF protection

To enable Spinnaker and Jenkins to share a crumb to protect against CSRF...

1. Configure Spinnaker to enable the `csrf` flag. Make sure the `csrf` value as mentioned above is set to true.

    Here's what your configuration looks like:

    ```yaml
    jenkins:
      enabled: true
      masters:
      - name: <jenkins master name>
        address: http://<jenkins ip>/pathIfNeeded
        username: <jenkins admin user>
        password: <admin password>
        csrf: true
    ```

2. Install Strict Crumb Issuer Plugin in Jenkins:

    a. Under __Manage Jenkins__ > __Plugin Manager__ > __Available__, search for __Strict Crumb Issuer Plugin__, select __Install__

    ![](/docs/setup/other_config/ci/strict_crumb_issuer_plugin_install.png)

3. Enable CSRF protection in Jenkins:

    a. Under __Manage Jenkins__ > __Configure Global Security__, select __Prevent
    Cross Site Request Forgery exploits__.

    b. Under __Crumb Algorithm__, select __Strict Crumb Issuer__.

    c. Under __Strict Crumb Issuer__ > __Advanced__, deselect __Check the session ID__

    ![](/docs/setup/other_config/ci/jenkins_enable_csrf_strict.png)

## Enabling Backlinks from Jenkins to Spinnaker

You can configure `orca` such that it will update the description of a running Jenkins build and generate a suitable backlink.

Add the following to your `orca-local.yml` file the following:

```
spinnaker:
  baseUrl:
    www: https://spinnaker.ui.url
```

Jenkins backlinks will be generated as follows:
`This build was triggered by '<a href=...>{Pipeline Name}</a>' in Spinnaker.`

## Next steps

You can use Jenkins in your pipelines in one of three ways:
*   As a [pipeline trigger](/docs/guides/user/pipeline/triggers/jenkins/)
*   Using the built-in [Jenkins stage](/docs/reference/pipeline/stages/#jenkins)
*   Using the [Script stage](/docs/reference/pipeline/stages/#script)

After you've completed the setup above, you're ready to trigger pipelines with
Jenkins or run the Jenkins stage. This is sufficient for most use cases. See
[Triggering Pipelines with Jenkins](/docs/guides/user/pipeline/triggers/jenkins/)
for more information.

Using the Script stage requires further configuration. See [Configuring
the Script Stage](/docs/setup/other_config/features/script-stage/) to finish setting it up.
