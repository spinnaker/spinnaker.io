---

title:  "Upgrading"
description: Upgrading Spinnaker is a two step process. First, select the target version. Then, apply your change.
---

If you want to change Spinnaker versions using Halyard, you can read about
supported versions like so:

```bash
hal version list
```

And pick a new version like so:

```bash
hal config version edit --version $VERSION

# this will update Spinnaker
hal deploy apply 
```
