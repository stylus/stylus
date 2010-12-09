
test:
	@./support/expresso/bin/expresso \
		-I support \
		-I lib

.PHONY: test