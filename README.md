# Spinnaker.io Documentation and Community Site

The **spinnaker.io** website is the home for Spinnaker documentation and community resources. You can find the documentation files in Markdown under the `content` directory.

This site is built using [Hugo](https://gohugo.io) and the [Docsy](https://www.docsy.dev/) theme.

## Development

Clone the repository and pull in the theme submodule:

```sh
git clone https://github.com/spinnaker/spinnaker.io.git
cd spinnaker.io
git submodule update --init --recursive --depth 1
```

Install dependencies (this also downloads the correct version of Hugo):

```sh
npm install
```

Start the local development server:

```sh
npm start
```

Open the URL printed in the terminal in your browser. Hugo rebuilds and reloads automatically as you edit files.

## Contributing

1. Start new development branches off of the `master` branch.
2. Create a pull request from your branch onto `master`.
3. Netlify will spawn a preview build to verify build success.
4. Branches merged into `master` deploy to the live site.

### Adding content

Documentation lives in `content/en/docs/`. Each page is a Markdown file with frontmatter:

| Field | Description |
|---|---|
| `title` | Displayed on the content page |
| `linkTitle` | Displayed in the docs navigation menu |
| `description` | Short description, shown in directory listings |
| `weight` | Controls ordering in the menu (lowest first) |
| `mermaid` | Set to `true` to enable MermaidJS on the page |

### Adding diagrams

Use the `mermaid` shortcode and set `mermaid: true` in the page frontmatter:

```
{{< mermaid >}}
graph TB
  clouddriver --> clouddriver-caching
{{< /mermaid >}}
```

### Adding videos

Use the `customyoutube` shortcode to embed a YouTube video with explicit dimensions:

```
{{< customyoutube id="b7BmMY1kR10" width="320px" height="240px" >}}
```

### Theme customization

Theme overrides are in `./layouts`, `./assets`, and `./static`. The Docsy theme is vendored as a git submodule in `./themes/docsy` — make upgrades with care, as markup changes in the theme may affect existing SCSS customizations.

For more detailed reference on frontmatter, homepage config, and theme internals, see [docs/website-contributing.md](docs/website-contributing.md).
