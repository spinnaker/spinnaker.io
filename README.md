# Spinnaker.io Documentation and Community Site

The **spinnaker.io** website is the home for Spinnaker documentation and community resources. You can find the documentation files in Markdown under the `content` directory.

This site is built using [Hugo](https://gohugo.io) and the [Docsy](https://www.docsy.dev/) theme.

## Development

You'll need [Node.js](https://nodejs.org/) v18 or later and [Go](https://go.dev/) 1.25 or later. The Docsy theme is pulled in automatically as a [Hugo Module](https://gohugo.io/hugo-modules/) (see `go.mod`) — no submodule setup needed, but Hugo shells out to `go` to resolve it.

Clone the repository:

```sh
git clone https://github.com/spinnaker/spinnaker.io.git
cd spinnaker.io
```

Install dependencies (this also downloads the correct version of Hugo):

```sh
npm install
```

**macOS note:** Hugo no longer publishes a `.tar.gz` for macOS (only a signed `.pkg`), which the `hugo-installer` npm package used by `npm install` can't extract. On macOS, install Hugo yourself instead:

```sh
brew install hugo
```

Then run Hugo directly rather than through `npm start`/`npm run build`:

```sh
hugo server
```

Start the local development server (Linux/Windows, or after installing Hugo manually on macOS as above):

```sh
npm start
```

Open the URL printed in the terminal in your browser. Hugo rebuilds and reloads automatically as you edit files.

## Contributing

1. Start new development branches off of the `master` branch.
2. Create a pull request from your branch onto `master`.
3. Netlify will spawn a preview build to verify build success.
4. Branches merged into `master` deploy to the live site.

See [docs/website-contributing.md](docs/website-contributing.md) for content authoring, shortcodes, homepage config, and theme customization.

## Recent Updates
- Reorganized the installation documentation under `/docs/setup/install/` into clearer `Install` and `Configure` categories.
