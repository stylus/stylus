all: deps build

build:
	./node_modules/stylus/bin/stylus s/style.styl && \
	./node_modules/stylus/bin/stylus s/style.ie.styl

try:
	./node_modules/stylus/bin/stylus s/try.styl

serve:
	jekyll serve --watch --config _config.yml,_config-dev.yml

deps:
	which bundle || gem install bundler
	bundle check || bundle install
	npm install

.PHONY: all build try serve deps
