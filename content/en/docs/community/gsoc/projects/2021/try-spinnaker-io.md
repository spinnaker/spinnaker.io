---
layout: single
title:  "try.spinnaker.io"
sidebar:
  nav: community
---
**Goal**: One of the best ways to learn Spinnaker is to use Spinnaker. This project provides a hosted playground version of Spinnaker aimed for new users to test out its UI and core features.

**Status**: Active

**Source Code**: https://github.com/spinnaker/try.spinnaker.io 
## Team
- Student: Daniel Ko
- Mentor(s): Fernando Freire, Dan Johnston, Cameron Motevasselani

# Details

## Background
Spinnaker is a mature open source continuous delivery software platform used and contributed by Fortune 500 companies such as Netflix and Google. A common pain point for users who wish to test out Spinnaker is the overwhelming complexity of the setup process; users must have a Kubernetes cluster to deploy client applications, figure out what environment to deploy Spinnaker, and deal with a laundry list of configuration settings such as storage devices and authentication. 

While auto configuration scripts such as [Minnaker][] have been developed, a public hosted solution is more ideal for newcomers. A trend in outreach within the open source software community is to develop interactive versions of products that you can run from any web browser. Example would include [Go Playground][] and [Play with Docker][]. These services brings in potential users and spreads awareness to the open source project. The purpose of this project is to host a playground version of Spinnaker aimed for new users to test out its UI and core features which can be can easily accessed  from their web browsers.
## Project Details
Key features include 
- IaC via Terraform to host try.spinnaker.io on AWS using an EKS cluster
- Deployment of Spinnaker via Armory's open source [Spinnaker Operator][]
- Kubernetes deployment via Spinnaker
- AWS Load Balancer Controller to expose deployments
- User authentication via Google OAuth 2.0
- Private ECR registry
- Block all public images via [Portieris][]
- Script to deploy default pipelines
  - Auto resource cleanup 
  - Deploy demo web app
  - Deploy using [highlander][] strategy 

## Demos
- [Phase 1][]
- [Phase 2][]

[Minnaker]: https://github.com/armory/minnaker
[Go Playground]: https://play.golang.org/
[Play with Docker]: https://github.com/play-with-docker/play-with-docker
[highlander]: https://spinnaker.io/docs/guides/user/kubernetes-v2/rollout-strategies/#highlander-rollouts
[Spinnaker Operator]: https://github.com/armory/spinnaker-operator
[Portieris]: https://github.com/IBM/portieris
[Phase 1]: https://youtu.be/-_MRDYxtOrs
[Phase 2]: https://youtu.be/bBat90NUMsg?t=1865
