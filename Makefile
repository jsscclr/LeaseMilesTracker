# c/o: http://wonko.com/post/simple-makefile-to-minify-css-and-js
# Patterns matching CSS files that should be minified. Files with a -min.css
# suffix will be ignored.
CSS_FILES = $(filter-out %.min.css,$(wildcard \
	css/*.css \
	css/**/*.css \
))

# Patterns matching JS files that should be minified. Files with a -min.js
# suffix will be ignored.
JS_FILES = $(filter-out %.min.js,$(wildcard \
	js/*.js \
	js/**/*.js \
))

# Commands
CSS_MINIFIER = curl -X POST -s --data-urlencode "input@CSS_TMP" http://www.cssminifier.com/raw
JS_MINIFIER = curl -s -X POST --data-urlencode "js_code@JS_TMP" http://marijnhaverbeke.nl/uglifyjs 
# the closure-compiler seems to crash at random points 
# without any error messages
#JS_MINIFIER = curl -v \
				-d compilation_level=SIMPLE_OPTIMIZATIONS \
				-d output_format=text \
				-d output_info=compiled_code \
				--data-urlencode "js_code@JS_TMP" \
				http://closure-compiler.appspot.com/compile

CSS_MINIFIED = $(CSS_FILES:.css=.min.css)
JS_MINIFIED = $(JS_FILES:.js=.min.js)

# target: minify - Minifies CSS and JS.
minify: minify-css minify-js

# target: minify-css - Minifies CSS.
minify-css: $(CSS_FILES) $(CSS_MINIFIED)

# target: minify-js - Minifies JS.
minify-js: $(JS_FILES) $(JS_MINIFIED)

%.min.css: %.css
	@echo '  Minifying $< ==> $@'
	$(subst CSS_TMP,$(<),$(CSS_MINIFIER)) > $@
	@echo

%.min.js: %.js
	@echo '  Minifying $< ==> $@'
	$(subst JS_TMP,$(<),$(JS_MINIFIER)) > $@
	@echo

# target: clean - Removes minified CSS and JS files.
clean:
	rm -f $(CSS_MINIFIED) $(JS_MINIFIED)

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile

# target: push - minify and publish website
push : minify
	# rsync -avze ssh --dry-run --exclude=".*" --exclude=".*/" --delete ./ dreamhost:~/lease.philipmat.com/
	rsync -avze ssh --exclude=".*" --exclude=".*/" --delete ./ dreamhost:~/lease.philipmat.com/
