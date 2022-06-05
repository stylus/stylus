---
layout: default
permalink: docs/gedit.html
---

# gedit language-spec

Stylus ships with a temporary version of `styl.lang` for [GtkSourceView](https://live.gnome.org/GtkSourceView), based off [Yanekk](https://github.com/yanekk)'s [work](https://github.com/gmate/gmate/blob/master/lang-specs/scss.lang) on `scss.lang`.
 
 ![Stylus Language Specification for GtkSourceView](https://i.imgur.com/uBppL.png))

This is a start and provides a basic [language spec](https://live.gnome.org/Gedit/NewLanguage) for GtkSourceView editors such as [gedit](https://projects.gnome.org/gedit/).

**Installation Steps**
 
Download `styl.lang` to your local `language-specs` folder:

```bash
mkdir -p ~/.local/share/gtksourceview-2.0/language-specs/ && wget https://raw.github.com/stylus/stylus/master/editors/gedit/styl.lang -O ~/.local/share/gtksourceview-2.0/language-specs/styl.lang
```

For gtksourceview 3.0 (gedit 3.0), user:
 
```bash
mkdir -p ~/.local/share/gtksourceview-3.0/language-specs/ && wget https://raw.github.com/stylus/stylus/master/editors/gedit/styl.lang -O ~/.local/share/gtksourceview-3.0/language-specs/styl.lang
```

Update the MIME database and enjoy Stylus syntax in gedit!
 
```bash
cd ~/.local/share
update-mime-database mime
```

This is much more enjoyable than having gedit recognize your `.styl` files as Apache Confs!
 
 ---
 
 **Have a sweet tooth?**  Add more icing to gedit with gedit-icing: [https://github.com/niftylettuce/gedit-icing](https://github.com/niftylettuce/gedit-icing)
