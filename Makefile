
BUILD = node build/build.js

all:
	${BUILD}

lint:
	node build/lint.js

tests:
	node test/node/test.js

js:
	${BUILD} js

node:
	${BUILD} node

jquery:
	${BUILD} jquery

dev:
	node build/dev.js
	
init:
	git submodule update --init --recursive;
