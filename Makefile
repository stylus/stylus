
site: index.html main.css

index.html: assets/index.jade
	jade --pipe $< > $@

main.css: assets/main.styl
	stylus < $< > $@

.PHONY: site