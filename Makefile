
DOCS = $(shell find docs/*.md)
HTML = $(DOCS:.md=.html)

site: index.html main.css $(HTML)

index.html: assets/index.jade
	jade --pipe $< > $@

main.css: assets/main.styl
	stylus < $< > $@

%.html: %.md
	ronn --html --fragment < $< \
		| cat assets/head.html - assets/foot.html \
		> $@

clean:
	rm -f main.css index.html
	rm -f docs/*.html

.PHONY: site clean