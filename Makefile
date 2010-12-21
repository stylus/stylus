
test:
	@./support/expresso/bin/expresso \
		-I support \
		-I lib \
		$(TEST_FLAGS)

test-cov:
	@$(MAKE) test TEST_FLAGS=--cov

.PHONY: test test-cov