
SRC = $(shell find lib -name "*.js")
TESTS = $(shell find test -name "*.test.js")
TM_BUNDLE = editors/Stylus.tmbundle
TM_BUNDLE_DEST = ~/Library/Application\ Support/TextMate/Bundles

test: test-unit test-integration

test-unit:
	@./support/expresso/bin/expresso \
		-I support \
		-I lib \
		$(TEST_FLAGS) \
		$(TESTS)

test-integration:
	@node test/integration/test.js

test-cov:
	@$(MAKE) test TEST_FLAGS=--cov

docs: docs/index.html

docs/index.html: $(SRC)
	@mkdir -p docs
	dox \
	  --title "Switch" \
    --desc "Expressive CSS language for nodejs" \
		--ribbon http://github.com/learnboost/switch \
		--private \
		$^ > $@

install-bundle:
	cp -fr $(TM_BUNDLE) $(TM_BUNDLE_DEST)

.PHONY: test test-unit test-integration install-bundle test-cov docs