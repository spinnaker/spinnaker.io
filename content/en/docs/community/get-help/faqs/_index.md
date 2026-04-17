---
title: 'Frequently Asked Questions'
linkTitle: 'FAQ'
weight: 2
description:
---

## What are the integrations available to Spinnaker?

### Cloud providers

- Amazon Web Services
- Google Cloud Platform
- Cloud Foundry
- DC/OS
- Kubernetes
- Microsoft Azure
- Netflix Titus

Others are avaialble via custom plugins.

### CI platforms

- Jenkins
- Travis
- AWS CodeBuild
- Concourse
- Google CodeBuild
- Artifactory

### Source repositories

- GitHub
- BitBucket Server / Stash
- GitLab
- AND MORE!

### Messaging support

- Email
- Slack
- Twilio
- CDEvents

### Docker Registries

- Anything with support for the [v2 Docker Registry API](https://docs.docker.com/registry/spec/api/)
- Any OCI Compliant registry

If you would like to add your own integration, we're happy to help you out in the slack channel.

## I want to build my own cloud provider, how do I start?

Adding a new cloud provider is not a simple task. You would want to modify Clouddriver and Deck modules to support
your new cloud provider. AN example
of [nomad as a plugin](https://github.com/spinnaker-plugin-examples/nomadPlugin/tree/master/nomad-clouddriver) has been
created though not fully functional as a starting area.

## How do I store my Spinnaker application in version control?

There are two kinds of application metadata at play within Spinnaker.

1. Data unique to Spinnaker, e.g. pipelines and their execution state, active triggers, deployment strategies, etc.
   Currently, these are stored inside SQL, but managing pipelines is a process managed externally with various solutions
2. Data and relationships between different Spinnaker resources. These come entirely from data available from the
   underlying platform (AWS, GCP, etc...), and are derived from either
   a. Platform state, e.g. instance health, load balancer and server group relationships, etc...
   b. Spinnaker's naming conventions. For example, if you create a server group with name `myapp-dev-v000`, Spinnaker
   picks up this name from the platform and derives that you have an application `myapp`, with a cluster named
   `myapp-dev`, which contains a single server group with version `v000`.

## Where can I find the Spinnaker API?

If you've installed Spinnaker, and the API server [Gate](https://github.com/spinnaker/spinnaker/tree/main/gate) is running and accessible (
usually at `localhost:8084`) navigate your browser to `<gate_endpoint>/swagger-ui.html` for the auto-generated API docs.
By default this is [localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html).
