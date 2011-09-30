
DOCS = $(shell find docs/*.md)
HTML = $(DOCS:.md=.html)

site: index.html try.html main.css $(HTML)

%.html: assets/%.jade
	jade < $< --path $< > $@

main.css: assets/main.styl
	stylus < $< > $@

%.html: %.md
	@markdown $< \
		| cat assets/head.html - assets/foot.html \
		> $@

clean:
	rm -f main.css index.html
	rm -f docs/*.html

.PHONY: site clean