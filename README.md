# Spinnaker.io Documentation and Community Site

The **spinnaker.io** website is the home for Spinnaker documentation and community resources. You can find the documentation files in Markdown under the `content` directory.

This site is built using [Hugo](https://gohugo.io) and the [Docsy](https://www.docsy.dev/) theme.

## Development

You'll need [Node.js](https://nodejs.org/) v16 or later.

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

See [docs/website-contributing.md](docs/website-contributing.md) for content authoring, shortcodes, homepage config, and theme customization.
