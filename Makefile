
TESTS = $(shell find test -name "*.js")

test:
	@./support/expresso/bin/expresso \
		-I support \
		-I lib \
		$(TEST_FLAGS) \
		$(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS=--cov

.PHONY: test test-cov