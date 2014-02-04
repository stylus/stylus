build:
	./node_modules/stylus/bin/stylus s/style.styl && \
	./node_modules/stylus/bin/stylus s/style.ie.styl

try:
	./node_modules/stylus/bin/stylus s/try.styl

serve:
	jekyll serve --watch --config _config.yml,_config-dev.yml

.PHONY: build try serve
