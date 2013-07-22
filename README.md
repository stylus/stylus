# Textyll

## Features

1. Smart titles.
2. Tables of Content for content.
3. Link handles.
4. Smart post links.

## Install

``` sh
git clone https://github.com/kizu/textyll.git --recursive
```

## Local Usage

``` sh
jekyll serve --watch
```


## Available liquid variable in layouts/pages:

- `{{ lang }}` — the language of the page, is set either as default one in config, or from the page's categories, or from the page's metadata.
- `{{ root_url }}` — the URL to the root of the site, either absolute (if this is set in a config), or relative (like `../` on subpages), contains trailing slash.
- `{{ title }}` — the title of the page, got either from the page metadata or from the first first-level header in a `.md` file (like `# Page title`)
- `{{ processed_content }}` — the content of the page with all the extra stuff happened, like removed the first header (so you could use it as `{{ title }}`), handled links etc.
- `{{ toc }}` — the Table of Contents for the page, made automagically from the `.md` structure of the page (all the headers except for the first level one go here).