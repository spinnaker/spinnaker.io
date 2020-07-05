# Spinnaker.io Documentation and Community Site

This site is built using [Hugo](https://gohugo.io) and the [Docsy Theme](https://www.docsy.dev/).

## Contributing

1. Start new development branches off of the `master` branch. 
2. Create a pull request from your branch onto `master`. 
3. Netlify will spawn a preview branch which will verify build success.
4. Branches merged back into `master` will deploy to the current active version-branch of the site.

## Documentation Versioning


## Translation

At present, there is only one language in the `./content` directory. Docsy assumes lang-en and uses this language automatically, but you can add additional directories with different contents. There is also a langauge switcher in the navbar that can be enabled by adding that language to the `[languages]` map in `.config.toml`.

## Docs Frontmatter Variables

`title`: Displayed on the content page  
`linkTitle`: displayed where a link to the page appears (in the docs menu)  
`weight`: Determines the order of appearance in lists of content in the same directory, lowest first. To let all titles appear in alphabetical order, remove all weights.  
`description`: Short description, appears in lists of directory contents and on content page.  
`mermaid`: Boolean `true` indicates that MermaidJS should be loaded on the page.  

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
