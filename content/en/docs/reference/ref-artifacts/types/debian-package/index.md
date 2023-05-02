---
title:  "Debian Package"
description: A Debian Package artifact is a reference to a package to be installed.
---

These artifacts are generally consumed by the Bake stage.

## HTTP file artifact in the UI

The pipeline UI exposes the following fields for the Debian Package artifact:

<table>
  <thead>
    <tr>
      <th></th>
      <th>Explanation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Account</strong></td>
      <td>An HTTP artifact account.</td>
    </tr>
    <tr>
      <td><strong>URL</strong></td>
      <td>The fully-qualified URL from which the file can be read.</td>
    </tr>
  </tbody>
</table>

### In a trigger

When configuring certain triggers, like Pubsub you can use a custom artifact.

{{< figure src="./expected-artifact-debian-package.png" caption="Configuring Debian Package fields in a pipeline trigger's expected artifact settings." >}}

### In a pipeline stage

When configuring a "Bake" stage, it automatically searches for a Debian package artifact in the context.

## Debian Package artifact in a pipeline definition

The following are the fields that make up an HTTP file artifact:

| Field       | Explanation                        |
|-------------|------------------------------------|
| `type`      | Always `deb`.                      |
| `reference` | The full name of the package file. |
| `name`      | The name of the package.           |
| `version`   | Version of the package.            |
| `location`  | N/A                                |

The following is an example JSON representation of an HTTP file artifact, as it
would appear in a pipeline definition:

```json
{
    "type": "deb",
    "name": "spinnaker-igor",
    "version": "1.54.0.224.692755-3_all",
    "reference": "spinnaker-igor_1.54.0.224.692755-3_all.deb"
}
```
