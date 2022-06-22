---
title: 'Versions'
linkTitle: 'Versions'
menu:
  main:
    weight: 20
---

The Spinnaker releases listed below are top-level versions tying together each
Spinnaker subcomponents' versions.

These have been validated together in an end-to-end integration test suite
curated by the Spinnaker community, and represent a more maintainable, easy to
upgrade Spinnaker.

While it's still possible to install each Spinnaker subcomponent's versions
independently, there is no guarantee that they will work together.

If you want to see what each top-level version is comprised of, run

```bash
hal version bom <version>
```

to see the commit hash and tag matching `v-<version>` of each
subcomponent. Prior to Spinnaker Release `1.27.0` the tag pattern was
`version-<version>`.

## Latest stable

{{< latest-stable >}}

> To be notified when new Spinnaker versioned releases are available, please join the
> [spinnaker-announce](https://groups.google.com/forum/#!forum/spinnaker-announce) Google
> Group (requires a Google account).

## Deprecated Versions

{{< deprecated-versions >}}
