MOCHA_OPTS= --check-leaks
REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--globals setImmediate,clearImmediate \
		$(MOCHA_OPTS)

.PHONY: test
