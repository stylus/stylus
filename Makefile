
SRC = $(shell find lib -name "*.js")
TM_BUNDLE = editors/Stylus.tmbundle
TM_BUNDLE_DEST = ~/Library/Application\ Support/TextMate/Bundles
REPORTER = dot

test:
	@./node_modules/.bin/mocha \
		--require should \
		--bail \
		--reporter $(REPORTER)

test-cov: lib-cov
	STYLUS_COV=1 $(MAKE) REPORTER=html-cov > coverage.html

lib-cov: lib
	jscoverage $< $@

install-bundle:
	mkdir -p $(TM_BUNDLE_DEST)
	cp -fr $(TM_BUNDLE) $(TM_BUNDLE_DEST)

update-bundle:
	cp -fr $(TM_BUNDLE_DEST)/Stylus.tmbundle editors

benchmark:
	@node bm.js

.PHONY: test install-bundle update-bundle benchmark test-cov