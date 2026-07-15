---
title: "Getting Set Up for Spinnaker Development"
linkTitle: "Getting Set Up"
weight: 2
description: >
  Set up a development environment on your local machine.
---

## Overview

This page describes the steps a Developer should take to fetch Spinnaker's codebase and get set up to work on it.

Follow the [contributing guidelines](/community/contributing/code/submitting/)
if you plan to submit your work as a patch to the open source project.

## System Requirements

This guide assumes you have access to a machine with a minimum specification of:

- At least 16 GB of RAM
- At least 6 cores CPU


### MacOS

These are some tools but install additional as needed the tools for your needs

* homebrew: Not required but useful - [can be installed via here](https://brew.sh/)
* Docker: either docker desktop or rancher. CAUTION:  Spinnaker uses TestContainers heavily and you'll potentially need
  to adjust settings for test containers which is out of the scope of this guide.
* git: Installed usually via Xcode Command Line Tools - often by trying to run git from a terminal
* curl: `brew install curl` - not required explicitly but useful for testing
* JDK 17: A JDK is required since we're building from source.  This can be done using [sdkman](https://sdkman.io/) or any other installation tool.
* node/npm: (version >=16)
* yarn: `npm install -g yarn` or [guide](https://yarnpkg.com/lang/en/docs/install/)
* mysql: `docker run -e MYSQL_ROOT_PASSWORD=changeit -it --rm mysql:8 --verbose` is a good basic example but will need the databases configured as documented in the [storage configuration](/docs/setup/install/storage/).  Adjust the docker command to persist if you want to keep your data between runs.  
* redis: `docker run -d --rm --name redis -p 0.0.0.0:6379:6739 valkey/valkey:8` as an example.
* [Set up your cloud provider of choice]({{< relref "/docs/setup/install/providers/" >}}).  Locally these providers would be added to `~/.spinnaker/clouddriver-local.yml` files
* Add the other sql/redis/other configuration to your `~/.spinnaker/*.yml` files for development

Next, clone the [spinnaker monorepo](https://github.com/spinnaker/spinnaker).  You can now start spinnaker assuming you've configured the necessary settings locally for sql/redis.
```shell
cd spinnaker
./gradlew run
```
This starts up *ALL* the spinnaker services service via a single gradle task.  Services can be started independently as needed.  Keep in mind that there is a dependency
tree for services that will mean that things won't start unless a dependent service is up and running.  Front50 is a common base service dependency for all the other
spinnaker services.  

## Making Changes to Spinnaker

Once you have a working LocalGit deployment you can begin to make changes to the codebase.
After you've made edits in the code of a service you can see those changes reflected
by restarting the services as needed.

## Configuring an IDE

### IntelliJ

Import the project into IntelliJ:
1. Select `New` > `Project from Existing Sources`
1. Navigating to the `build.gradle` file (i.e., `~/dev/spinnaker/build.gradle`)

## Debugging

Each Java service can be configured to listen for a debugger. To start the JVM in debug
mode, set the Java system property `DEBUG=true`.

The JVM will then listen for a debugger to be attached on a port specific to that service. The
service-specific debug ports are as follows:

| Service     | Port |
| :---------- | :----|
| Gate        | 8184 |
| Orca        | 8183 |
| Clouddriver | 7102 |
| Front50     | 8180 |
| Rosco       | 8187 |
| Igor        | 8188 |
| Echo        | 8189 |

The JVM will not wait for the debugger to be attached before starting a service; the relevant
JVM arguments can be seen and modified as needed in the service's `build.gradle` file.

## Next steps

* If you haven't done so already, read through the
[Spinnaker Architecture reference]({{< relref "/docs/reference/architecture/_index.md" >}}) to learn more about the individual
services' responsibilities, their dependencies on each other, and their port mappings.
* Consider working on one of the
[issues marked "beginner-friendly"](https://github.com/spinnaker/spinnaker/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3A%22beginner+friendly%22)
to start learning and contributing to Spinnaker right away.
* [Sign up for Spinnaker's Slack community](https://join.slack.com/t/spinnakerteam/shared_invite/zt-3f4dqg66a-hX~tWeWPL3Sfnj3F8Ie2xg) and join the [#dev](https://spinnakerteam.slack.com/messages/C0DPVDMQE/) channel to ask questions and get feedback while developing Spinnaker.
* Read through the [New Stage guide](../extending/new-stage) to add new stages and steps
* Read about extending spinnaker [with CRD handling](../extending/crd-extensions)
