
TESTS = $(shell find test -name "*.test.js")

test:
	@./support/expresso/bin/expresso \
		-I support \
		-I lib \
		$(TEST_FLAGS) \
		$(TESTS) \
		&& node test/integration/test.js

test-cov:
	@$(MAKE) test TEST_FLAGS=--cov

.PHONY: test test-cov