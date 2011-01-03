
SRC = $(shell find lib -name "*.js")
TESTS = $(shell find test -name "*.test.js")

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

.PHONY: test test-unit test-integration test-cov docs