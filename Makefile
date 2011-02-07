
SRC = $(shell find lib -name "*.js")
TM_BUNDLE = editors/Stylus.tmbundle
TM_BUNDLE_DEST = ~/Library/Application\ Support/TextMate/Bundles

test: test-integration

test-integration:
	@node test/run.js

docs: docs/index.html

docs/index.html: $(SRC)
	@mkdir -p docs
	dox \
	  --title "Stylus" \
    --desc "Expressive, dynamic, robust CSS for nodejs" \
		--ribbon http://github.com/learnboost/stylus \
		--private \
		$^ > $@

install-bundle:
	cp -fr $(TM_BUNDLE) $(TM_BUNDLE_DEST)

update-bundle:
	cp -fr $(TM_BUNDLE_DEST)/Stylus.tmbundle editors

.PHONY: test test-integration install-bundle docs update-bundle