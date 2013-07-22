# Textyll

## Features

### Smart titles

One of the cool thing of markdown is that those files could be read as a plain text files. But for default Jekyll you need to set up the titles in the page's metadata, and that's not cool.

Textyll provides you a handy option to just go and use the first header from the `.md` file as its title — it would be available as a `{{ title }}` variable, would go to the `<title>` of the page etc.

Now, your `.md` file could look just like this:

``` markdown
---
layout: default
---

# Hello, world!

Blah blah
```

Why isn't this in the default Jekyll? :)

### Tables of Content

Ok, so you like long documents with a lot of sections? Textyll would provide you a nice Table of Content, so you could have a list of links to all the headers on the page!

Just use the `{{ toc }}` variable in your layouts!

### Link handles

Textyll makes writing blog posts really easy with some helpers for links.

- `[Link to twitter user](@username)` would be a link to `https://twitter.com/username`.
- `[Link to GitHub](gh:username)` would be a link to `https://github.com/username`, and, of course, [Link to GitHub](gh:username/repo) would be a link to `https://github.com/username/repo`.

Those two are default link handles [defined in config](https://github.com/kizu/textyll/blob/gh-pages/_config.yml#L16), it's easy to add your own, the syntax is obvious:

``` YAML
link_handles:
    - prefix: "@"
      handle: "https://twitter.com/"
    - prefix: "gh:"
      handle: "https://github.com/"
```

Right now it's just a simple find-and-replace, but maybe there would be something even handier!

### Smart post links

And while you can have handy links to some services in your markdown, why don't have easy links to your own blog posts?

Imaging you have a post named as `2013-07-23-foobar-baz` in your `_posts` dir, the last part, the `foobar-baz` would be an ID of your post, so you could use it in your posts like this:

``` markdown
In [one of my previous cool posts](:foobar-baz) I wrote some awesome stuff…
```

Yep, that's right, you can write `:ID` instead of a full link to your post, and you'll get what you expect here.

Only blog posts could be linked like this ATM, but there is a chance pages could be linked this way later.

### Smart quotes

A small aesthetic touch to your links: a lot of designers say that quote symbols inside of links look like shit when underlined, so I added this little feature. Write your quoted links like this:

```
Hey, “[Quoted link!](…)”
``` 

And you'd get it in a code like this:

``` HTML
<a href="…" style="text-decoration:none">“<span style="text-decoration: underline">Quoted link!</span>”</a>
```

Of course, there is a chance you'd like to use proper classes instead of inline styles, for this you could use the corresponding variables from config: `quoted_link_wrapper_class` for the wrapper `<a>` tag and `quoted_link_inner_class` for the inner span.

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