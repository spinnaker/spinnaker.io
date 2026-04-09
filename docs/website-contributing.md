# Website Contributing Guide

Reference documentation for contributors working on the spinnaker.io website itself.

## Adding content

Documentation lives in `content/en/docs/`. Each page is a Markdown file with frontmatter.

## Docs frontmatter

| Field | Description |
|---|---|
| `title` | Displayed on the content page |
| `linkTitle` | Displayed where a link to the page appears in the docs menu |
| `weight` | Controls ordering within the menu (lowest first). Remove to use alphabetical order. |
| `description` | Short description, shown in directory listings and on the content page |
| `mermaid` | Set to `true` to enable MermaidJS on the page |

## Adding diagrams

Use the `mermaid` shortcode and set `mermaid: true` in the page frontmatter:

```
{{< mermaid >}}
graph TB
  clouddriver --> clouddriver-caching
{{< /mermaid >}}
```

## Adding videos

Use the `customyoutube` shortcode to embed a YouTube video with explicit dimensions:

```
{{< customyoutube id="b7BmMY1kR10" width="320px" height="240px" >}}
```

## Homepage configuration

Edit `./content/en/_index.md` to change homepage frontmatter variables.

### News link

| Field | Description |
|---|---|
| `news_banner` | Set to `true` to show the news link in the hero panel |
| `news_text` | The link text |
| `news_link` | The link target URL |

Example:

```yaml
---
title: 'Spinnaker'
subtitle: 'Cloud Native Continuous Delivery'
subtitle_1: 'Fast, safe, repeatable deployments for every enterprise'
date: '2020-06-04'
type: 'en'
is_index: true
layout: 'index'
has_carousel: true
news_banner: false
news_text: 'Testing news banner'
news_link: 'https://google.com'
---
```

### Promo banner

The promo banner across the top of the homepage is controlled by `[params.promoBanner]` in `config.toml`:

```toml
[params.promoBanner]
show = true
text = "Spinnaker Summit is co-located with KubeCon this year! Join us on Oct 23-24 in Detroit."
ctaLink = "http://go.armory.io/ss22"
ctaText = "Register"
label = "UPCOMING EVENT"
```

## Theme customization

Theme overrides are in `./layouts`, `./assets`, and `./static`. The Docsy theme is vendored as a git submodule in `./themes/docsy`.

The entire theme SCSS collection has been copied into `./assets/scss` so that Docsy's color variables remain available. Some of these files have been further modified to alter the appearance of site components. If something breaks after a theme upgrade, compare the previous markup for that component and verify that old SCSS selectors are still valid.

Bootstrap and Font Awesome assets are vendored inside `./themes/docsy/assets/vendor/`. If a theme upgrade breaks styles, verify that the paths to these dependencies within `./themes/docsy` are still valid.

## Translation

At present, there is only one language in the `./content` directory. Docsy assumes `lang-en` and uses it automatically. Additional languages can be added by creating new directories under `./content` and adding them to the `[languages]` map in `config.toml`. A language switcher in the navbar can be enabled the same way.
