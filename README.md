# Spinnaker.io Documentation and Community Site

This site is built using [Hugo](https://gohugo.io) and the [Docsy Theme](https://www.docsy.dev/).

## Contributing

1. Start new development branches off of the `master` branch.
2. Create a pull request from your branch onto `master`.
3. Netlify will spawn a preview branch which will verify build success.
4. Branches merged back into `master` will deploy to the current active version-branch of the site.

## Using this repository

You can run the website locally using Hugo (Extended version).

## Prerequisites

- [Hugo (Extended version)](https://gohugo.io/); check the Hugo version specified in `netlify.toml`.

Before you start, install the dependencies. Clone the repository and navigate to the directory:

```
git clone https://github.com/spinnaker/spinnaker.io.git
cd spinnaker.io
```

The Spinnaker website uses the [Docsy Hugo theme](https://github.com/google/docsy#readme). Pull in the submodule and other development dependencies by running the following:

```
# pull in the Docsy submodule
git submodule update --init --recursive --depth 1
```

## Running the website locally using Hugo

Make sure to install the Hugo extended version specified by the `HUGO_VERSION` environment variable in the [`netlify.toml`](netlify.toml#L10) file.

To build and test the site locally, run:

```bash
hugo server
```

This will start the local Hugo server on port 1313. Open up your browser to http://localhost:1313 to view the website. As you make changes to the source files, Hugo updates the website and forces a browser refresh.

## Documentation Versioning

## Translation

At present, there is only one language in the `./content` directory. Docsy assumes lang-en and uses this language automatically, but you can add additional directories with different contents. There is also a langauge switcher in the navbar that can be enabled by adding that language to the `[languages]` map in `.config.toml`.

## Theme Customization

The Docsy theme is installed as a git submodule to this site. To update the theme, follow the Docsy documentation for git submodules. Make theme upgrades with care. Any changes to markup in the theme may render existing SCSS modifications ineffective.

Overrides to the theme are in `./layouts`, `./assets`, and `./static`. In order to continue to use Docsy's color variables, the **entire** theme SCSS collection is has been copied to `./assets`. Some of these SCSS files have been further modified to alter the appearance of various site components. If something "breaks" on upgrade, a good first step is to compare the previous markup for that component and make sure old SCSS selectors are still valid.

Dependencies are loaded into `./assets/scss` from `./themes/docsy`. If subsequent theme upgrades fail to load Bootstrap or Font Awesome assets, verify that the paths to these vendor dependencies within `./themes/docsy` are still valid.

## Docs Frontmatter Variables

`title`: Displayed on the content page  
`linkTitle`: displayed where a link to the page appears (in the docs menu)  
`weight`: Determines the order of appearance in lists of content in the same directory, lowest first. To let all titles appear in alphabetical order, remove all weights.  
`description`: Short description, appears in lists of directory contents and on content page.  
`mermaid`: Boolean `true` indicates that MermaidJS should be loaded on the page.

## Homepage Frontmatter Page Params

Edit the file `./content/en/_index.md` to change the homepage frontmatter variables.

### Changing the News Link

`news_banner`: Boolean `true` enables the news link in the hero info panel.  
`news_text`: Sets the news link text.  
`news_link`: Sets the news link target.

Example news link:

```
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
...
---
```

![desktop homepage hero](https://user-images.githubusercontent.com/70309473/125411287-9e818f80-e372-11eb-99eb-d24404e387e1.png)
![tablet homepage hero](https://user-images.githubusercontent.com/70309473/125411010-582c3080-e372-11eb-83e4-7564097b3f2d.png)
![mobile homepage hero](https://user-images.githubusercontent.com/70309473/125411499-d4bf0f00-e372-11eb-9ab0-1ecd6497c1ab.png)

## Mermaid

Mermaid is loaded into content pages only when the boolean frontmatter variable `mermaid` is set to `true`.

1. Use the `mermaid` shortcode to make sure your graph isn't processed as markdown:

```
{{< mermaid >}}
graph TB

clouddriver(Clouddriver) --> clouddriver-caching(Clouddriver-Caching);
clouddriver --> clouddriver-rw(Clouddriver-RW);
clouddriver --> clouddriver-ro(Clouddriver-RO);
clouddriver --> clouddriver-ro-deck(Clouddriver-RO-Deck)

classDef default fill:#d8e8ec,stroke:#39546a;
linkStyle default stroke:#39546a,stroke-width:1px,fill:none;

classDef split fill:#42f4c2,stroke:#39546a;
class clouddriver-caching,clouddriver-ro,clouddriver-ro-deck,clouddriver-rw,echo-scheduler,echo-worker split
{{< /mermaid >}}
```

2. Add the frontmatter variable to the page: `mermaid: true`.

## Custom YouTube Shortcode

The internal YouTube embed template provided by Hugo does not allow for the setting if height and width. A custom YouTube shortcode has been added to the repository to allow for the setting of height and width of YouTube videos embedded in Markdown content. Width and height should always include percent or unit of measure.

```
{{< customyoutube id="b7BmMY1kR10" width="320px" height="240px" >}}
```

## Promo Banner on homepage

The promo banner across the top of the home page is displayed depending on a parameter in config.toml and also configured there:

[params.promoBanner]
show = true
text = "Spinnaker Summit is co-located with KubeCon this year! Join us on Oct 23-24 in Detroit."
ctaLink = "http://go.armory.io/ss22"
ctaText = "Register"
label = "UPCOMING EVENT"

