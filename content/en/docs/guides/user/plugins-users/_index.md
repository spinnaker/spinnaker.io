---
title: "Plugin User Guide"
no_list: true
description: >
  Add, configure, and deploy plugins to Spinnaker.
---

## Overview

Spinnaker uses [PF4J-Update](https://github.com/pf4j/pf4j-update) to load and manage plugins. These plugins can implement a PF4J extension point or be Spring components. See the [Plugin Creators Guide]({{< ref "plugin-creator" >}}) for details.

## Terms

**plugins.json**

* required file
* defines one to many plugins in a plugin repository
* each plugin definition has an id, description, provider, and a collection of releases (version, date, requires, sha512sum, state, url)
* the plugin developer provides access to this file

**repositories.json**

* optional file
* defines one to many plugin repositories
* each repository definition consists of a unique identifier and the path to a `plugins.json` file
* the plugin developer may supply this file

## Plugin requirements

* The plugin is either a [Plugin Framework for Java](https://github.com/pf4j/pf4j)(PF4J) plugin or a Spring plugin
* The plugin repository is a web location that Spinnaker can access, like a GitHub repository

## How to add a plugin to Spinnaker

Adding a plugin to Spinnaker consists of the following steps:

1. [Add a plugin repository](#add-a-plugin-repository)
1. [Add a plugin](#add-a-plugin-repository)
1. [Add a Deck proxy to Gate](#add-a-deck-proxy-to-gate) (Optional)
1. [Redeploy Spinnaker](#redeploy-spinnaker)

## Add a plugin repository

_Note: Your plugins.json and repository.json files must be in a location that Spinnaker can access. Token authentication
to private repositories is not supported. Consider storing your plugins and repository files in an AWS S3 bucket (or
similar) instead of a private repository._

When you configure a repository, you tell Spinnaker where to find the `plugins.json` file that defines the plugins you
want to use. Each plugin repository entry in Spinnaker consists of a unique name and a URL.

If you want a repository to point to a single `plugins.json` file, you add it like this:

```yaml
spinnaker:
  extensibility:
    repositories:
      observabilityy-plugin:
        url: https://raw.githubusercontent.com/armory-plugins/armory-observability-plugin-releases/master/plugins.json
```
It's common to set this in the `spinnaker-local.yml` but it can be set on a per service basis for specific 
services.

If you want a single plugin repository entry to point to multiple `plugins.json` files, you need to create a
`repositories.json` file that defines a collection of plugin repositories. The file format is:

```json
[
  {
    "id": "<unique-repo-name>",
    "url": "<url-of-plugins.json-file>"
  }
]
```

For example:

```json
[
  {
    "id": "spinnaker-plugin-examples",
    "url": "https://raw.githubusercontent.com/spinnaker-plugin-examples/examplePluginRepository/master/plugins.json"
  },
  {
    "id": "my-company-internal-plugins",
    "url": "https://<my-company-internal-github>/<repo-name>/plugins.json"
  },
  {
    "id": "my-plugins",
    "url": "https://github.com/aimeeu/pluginRepository/blob/master/plugins.json"
  }
]
```

Save your `repositories.json` file in a web location that Spinnaker can access. Then you can add a new plugin repository
using the `repositories.json` file:

```yaml
spinnaker:
  extensibility:
    repositories:
      all-the-plugins:
        url: https://raw.githubusercontent.com/aimeeu/all-the-plugins/master/repositories.json
```

Don't forget to apply your configuration changes by redeploying spinnaker.

## Add a plugin
> Note: when added to spinnaker-local.yml, each service attempts to load the plugin. This
> means that when you restart Spinnaker, each service restarts, downloads the plugin, and checks if an
> extension exists for that service. 

After you have added your plugin repository, you can add your plugin to Spinnaker. 

```yaml
spinnaker:
  extensibility:
    repositories:
      observabilityy-plugin:
        url: https://raw.githubusercontent.com/armory-plugins/armory-observability-plugin-releases/master/repositories.json
    deck-proxy:
      enabled: true
      plugins:
        Armory.ObservabilityPlugin:
          enabled: true
          version: 0.1.1
    plugins:
      Armory.ObservabilityPlugin:
        enabled: true
        version: 1.5.0
        config.metrics:
          prometheus:
            enabled: true
            meterRegistryConfig:
              armoryRecommendedFiltersEnabled: false
```

The plugin distributor should provide you with the plugin id LIKE `Armory.ObservabilityPlugin` and supported `version`
and If you have to hunt for these values, you can find `id` and `version` in 
the `plugins.json` file, but you have to look at the code to find the value for
`extensions`. Search for the deprecated `@ExtensionConfiguration` or the 
current `@PluginConfiguration` annotation. Both take a value, which is the extension name.

Example of the deprecated `@ExtensionConfiguration` annotation in the [pf4jStagePlugin](https://github.com/spinnaker-plugin-examples/pf4jStagePlugin/blob/master/random-wait-orca/src/main/kotlin/io/armory/plugin/stage/wait/random/RandomWaitConfig.kt), which is written in Kotlin:

```kotlin
package io.armory.plugin.stage.wait.random

import com.netflix.spinnaker.kork.plugins.api.ExtensionConfiguration

@ExtensionConfiguration("armory.randomWaitStage")
data class RandomWaitConfig(var defaultMaxWaitTime: Int)
```

Example of the `@PluginConfiguration` annotation in the [Notification Plugin](https://github.com/spinnaker-plugin-examples/notificationPlugin/blob/master/notification-agent-echo/src/main/kotlin/io/armory/plugin/example/echo/notificationagent/HTTPNotificationConfig.kt#L5), which is also written in Kotlin:

```kotlin
package io.armory.plugin.example.echo.notificationagent

import com.netflix.spinnaker.kork.plugins.api.PluginConfiguration

@PluginConfiguration("armory.httpNotificationService")
data class HTTPNotificationConfig(val url: String)
```

Plugin configuration variables are passed into the primary class constructor. If the plugin developer doesn't specify
configuration details, you can find key and type, or a configuration tree, by looking at the primary class constructor.

Another example using the Random Wait Plugin:
```yaml
spinnaker:
  extensibility:
    plugins:
      Armory.RandomWaitPlugin:
        id: Armory.RandomWaitPlugin
        enabled: true
        version: 1.1.14
        extensions:
          armory.randomWaitStage:
            id: armory.randomWaitStage
            enabled: true
            config:
              defaultMaxWaitTime: 60
```

### Plugin configuration 

To avoid each service restarting 
and downloading the plugin, _do not_ add the plugin to the `spinnaker-local.yml`. Instead, configure the plugin in the service's local file. For example, if your plugin extends Orca, add configuration to your `orca-local.yml` file.

```yaml
spinnaker:
  extensibility:
    plugins:
      <unique-plugin-id>:
        id: <unique-plugin-id>
        enabled: <true-false>
        version: <version>
        extensions:
          <extension-name>:
            id: <extension-name>
            enabled: <true-false>
            config: {}
```

## Add a Deck proxy to Gate

If your plugin has a Deck component, you need to configure a `deck-proxy` so Gate knows where to find the plugin.

In your `gate-local.yml` add:

```yaml
spinnaker:
   extensibility:
     deck-proxy:
       enabled: true
       plugins:
         <unique-plugin-id>:
           enabled: true
           version: <version>
       repositories:
         <unique-repo-name>:
           url: <url-to-repositories.json-or-plugins.json>
```

* `unique-plugin-id`: the plugin ID 
* `unique-repo-name`: the plugin repository ID 
* `url`: the location of the plugin repository

## Redeploy Spinnaker

Remember to apply your manifest changes after you have finished configuring your plugin.

## Deployment example

See the [pf4jStagePlugin Deployment Example]({{< ref "plugin-deploy-example" >}}) page for a walkthrough and troubleshooting.

## Resources

A central [repository for all Spinnaker plugins](https://github.com/spinnaker/plugins) is available as an example but is no longer maintained or used.

You can ask for help with plugins in the [Spinnaker Slack](https://join.slack.com/t/spinnakerteam/shared_invite/zt-3f4dqg66a-hX~tWeWPL3Sfnj3F8Ie2xg/) `#plugins` channel.
