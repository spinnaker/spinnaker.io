---
title: "Authentication & Authorization"
linkTitle: "Authentication & Authorization"
weight: 
description: 
---



This is a high-level explanation of how authentication and authorization work within Spinnaker itself.  


- Redis stores computed roles, default permissions, and roles from external systems
- Clouddriver gets known accounts
- Front50 gets known apps

## Setup & Configuration

For more information on actual use of this see [Setup Authentication and Authorization](/docs/setup/other_config/security/).
