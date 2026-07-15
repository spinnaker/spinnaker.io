---
title:  "Administrator functionality"
description: Administrators have complete control over your Spinnaker deployment.
---

## Introduction

In Spinnaker, it is possible to define that users belonging to a certain role are considered "Administrators". This
virtually removes all READ/WRITE restrictions to accounts and applications for these users.

> This feature gives admins an immense amount of power. Proceed with caution.

## Enable and Configure Admin functionality

### Manually add configuration in Fiat

In the `fiat-local.yml` config file, add the following:

```yaml
fiat:
  admin:
    roles:
      - devops-admin
```