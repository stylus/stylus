
site: index.html main.css

index.html: assets/index.jade
	jade --pipe $< > $@

main.css: assets/main.styl
	stylus < $< > $@

clean:
	rm -f main.css index.html

.PHONY: site clean