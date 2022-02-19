
SRC = $(shell find lib -name "*.js")
TM_BUNDLE = editors/Stylus.tmbundle

define DETERMINE_TEXTMATE_BUNDLE_PATH
cd /tmp && \
	cp /Applications/TextMate.app/Contents/Info.plist /tmp/textmate-info.plist && \
	plutil -convert json -r /tmp/textmate-info.plist && \
	(test `node -e " \
		var json = $$(cat /tmp/textmate-info.plist | tr "\n" " "); \
		console.log(json['CFBundleShortVersionString'][0]); \
		"` -gt 1) && \
			echo ~/Library/Application\ Support/TextMate/Managed/Bundles || \
			echo ~/Library/Application\ Support/TextMate/Bundles
endef

TM_BUNDLE_DEST = $(shell $(DETERMINE_TEXTMATE_BUNDLE_PATH))

test:
	@npm test

install-bundle:
	mkdir -p "$(TM_BUNDLE_DEST)"
	cp -fr "$(TM_BUNDLE)" "$(TM_BUNDLE_DEST)"

update-bundle:
	cp -fr "$(TM_BUNDLE_DEST)"/Stylus.tmbundle editors

benchmark:
	@node bm.js

.PHONY: test install-bundle update-bundle benchmark
