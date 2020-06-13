# Spinnaker.io Documentation and Community Site

This site is built using [Hugo](https://gohugo.io) and the [Docsy Theme](https://www.docsy.dev/).

## Documentation Versioning

Documentation is versioned using subdirectories in the `./content/{lang}/` directory. At present only `./content/en/v1.19` contains contents, but `./content/en/v1.20` has been created and added to the documentation version switcher nav menu. Update documentation version switcher nav menu select in `./config.toml`.

## Translation

At present, there is only one language in the `./content` directory. Docsy assumes lang-en and uses this language automatically, but you can add additional directories with different contents. There is also a langauge switcher in the navbar that can be enabled by adding that language to the `[languages]` map in `.config.toml`.


## TODO

- [ ] Newsletter signup (?)
- [ ] Format for news and videos list pages? Use docs template or other?
- [ ] Theming
- [ ] Layout for landing page
- [ ] Layout for getting started page

## Notes/Questions

- [ ] Please review the content hierarchy for the docs, since I'm combining what were a few separate directories from the Jekyll site. Just to make sure this is organized the way you want.
- [ ] Want Algolia search in nav bar (default) or get Algolia search to work with side nav in docs template?
- [ ] Docsy has a built-in version selector for documentation, will it meet the stated need? I can also create a new shortcode in order to place it elsewhere...
- [ ] Header hierarchy in some of the docs pages needs to be changed so that the page menu will work. Specifically, and for a11y reasons as well, there should never be more than one h1 on a page. I assume that can be done internally? 
- [ ] You may also want to shorten the `linkTitle` frontmatter variable for docs `_index.md` pages. Right now the long page titles makes the content menu very long.
- Docsy docs automatically renders a `description` frontmatter string below section and page titles. You may want to move the short descriptions at the beginning of docs pages into that frontmatter variable and out of page content. Ex: "The goal of this codelab is to trigger a Spinnaker pipeline with a Pub/Sub message from GCS upon upload of a tarball."
- Docsy also automatically renders a list of contents for each directory with an `_index.*` file in the `./contents` dir. So where pages have a table of contents written into the landing page that TOC could be removed. (This would make the docs easier to maintain in the long run.)
- [ ] Hugo's new markdown processor, goldmark, doesn't support some of the markdown conventions I'm seeing. For example, link attribute assignment: `{:target="\_blank"}`. I'm leaving these things in for now.

## Docs Frontmatter Variables

`title`: Displayed on the content page  
`linkTitle`: displayed where a link to the page appears (in the docs menu)  
`weight`: Determines the order of appearance in lists of content in the same directory, lowest first. To let all titles appear in alphabetical order, remove all weights.  
`description`: Short description, appears in lists of directory contents and on content page.
