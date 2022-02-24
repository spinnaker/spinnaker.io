---
title: 'Logging'
linkTitle: 'Logging'
weight: 28
description: >
  Spinnaker supports custom log configuration including structured logging.
---

There are two logging options in Spinnaker:

1. [basic logging](#basic-logging) - set root (default) and Java Class log levels.
2. [advanced logging with logback](#advanced-logging-with-logback) - configurable
   log levels, structured JSON output and other features.

The JSON log format available with `logback` provides the following key
advantages:

1. Logging providers index JSON formatted structured logs enabling rich query
   capabilities.
2. Multi-line Java exceptions become a single log line with the exception
   details stored in the `stack_trace` key.
3. JSON log events can include more information like:
   `X-SPINNAKER-EXECUTION-ID` and `X-SPINNAKER-REQUEST-ID`

## Basic logging

Add the following per service (eg: `orca-local.yml`) or to a shared
`spinnaker-local.yml` file.

```
logging:
  level:
    # Enable debug logging by changing level to DEBUG
    root: INFO  # default

    # Example setting per class log level output
    # Disable logging out `Evaluated 27 expression(s) - ({ json file })
    # com.netflix.spinnaker.orca.pipeline.util.ContextParameterProcessor: WARN
```

## Advanced logging with logback

For more information see the manual: https://logback.qos.ch/manual/index.html

### Installation

1. Create a file called `logback.xml` per Service or to share with below
   contents:

   ```
   <?xml version="1.0" encoding="UTF-8"?>
   <configuration>
     <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
       <!-- Default is JSON - https://github.com/logstash/logstash-logback-encoder#data-format -->
       <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
     </appender>

     <!-- Enable debug logging by changing level to DEBUG -->
     <root level="INFO">
       <appender-ref ref="CONSOLE" />
     </root>
   </configuration>
   ```

2. Mount `logback.xml` into your Spinnaker services at a known path like
   `/opt/spinnaker/config/logback.xml`.

   For Kubernetes you may wish to use a
   [ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/).

   **Halyard:**

   It's not possible to create an arbitrary `ConfigMap` with Halyard so
   instead you will need to:

   1. In Kubernetes, create a [ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/) with `logback.xml`.
   2. In Halyard, mount the `ConfigMap` using
      [Service Settings - custom volumes](https://spinnaker.io/docs/reference/halyard/custom/#using-custom-volumes).

      Note: [subPath](https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath)
      is not available in Halyard so the `logback.xml` file must be mounted
      into its own directory. For example:
      `/opt/spinnaker/config/logging/logback.xml`

3. Configure Spinnaker services to load `logback.xml`.

   In each of the service files (eg: `orca-local.yml`) or in a shared file
   (`spinnaker-local.yml`) replace any existing `logging:` configuration with:

   ```
   logging:
     config: /opt/spinnaker/config/logback.xml  # change path as necessary
   ```

### Set log level per class

Logging for some classes can be verbose and it may be preferable to log less.

For example, if the root log level is `INFO` you may wish exclude `INFO` log
output and log at `WARN` and below.

```
  <!-- Disable logging of SPeL evaluation errors due to log volume -->
  <!-- `Failed to evaluate {}` -->
  <logger name="com.netflix.spinnaker.kork.expressions.ExpressionTransform" level="WARN" />

  <!-- Disable logging out `Evaluated 27 expression(s) - ({ json file }) -->
  <logger name="com.netflix.spinnaker.orca.pipeline.util.ContextParameterProcessor" level="WARN" />
```

### Filter log keys

Add an `<excludeMdcKeyName>` block inside the `<encoder>` block like so:

```
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <!-- Exclude key from output due to long line lengths when a lot of accounts configured -->
      <excludeMdcKeyName>X-SPINNAKER-ACCOUNTS</excludeMdcKeyName>
    </encoder>
```
