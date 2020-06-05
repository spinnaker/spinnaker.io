# Spinnaker.io Documentation and Community Site

This site is built using [Hugo](https://gohugo.io) and the [Docsy Theme](https://www.docsy.dev/).

## Documentation Versioning

Documentation is versioned using subdirectories in the `./content/{lang}/` directory. At present only `./content/en/v1.19` contains contents, but `./content/en/v1.20` has been created and added to the documentation version switcher nav menu. Update documentation version switcher nav menu select in `./config.toml`.

## Translation

At present, there is only one language in the `./content` directory. Docsy assumes lang-en and uses this language automatically, but you can add additional directories with different contents. There is also a langauge switcher in the navbar that can be enabled by adding that language to the `[languages]` map in `.config.toml`.


## todo

- [ ] Newsletter signup (?)
- [ ] Docsy has a built-in version selector for documentation, will it meet the stated need? I can also create a new shortcode in order to place it elsewhere...
- [ ] Format for news and videos list pages? Use docs template or other?
- [ ] Want Algolia search in nav bar (default) or get Algolia search to work with side nav in docs template?
