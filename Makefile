
SRC = $(shell find lib -name "*.js")
TM_BUNDLE = editors/Stylus.tmbundle
TM_BUNDLE_DEST = ~/Library/Application\ Support/TextMate/Bundles

test: test-integration

test-integration:
	@node test/run.js

install-bundle:
	cp -fr $(TM_BUNDLE) $(TM_BUNDLE_DEST)

update-bundle:
	cp -fr $(TM_BUNDLE_DEST)/Stylus.tmbundle editors

benchmark:
	@node bm.js

.PHONY: test test-integration install-bundle update-bundle benchmark