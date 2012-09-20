#!/bin/bash
UGLIFY='../third_party/uglifyjs/bin/uglifyjs'
FILES=(
  '../src/initialize.js'
  '../src/pointermap.js'
  '../src/dispatcher.js'
  '../src/platform-events.js'
)

if [[ ! -x $UGLIFY ]]; then
cat <<EOF
Please run 'git submodule update --init' from the top level of the repository to
check out uglifyjs for the build process
EOF
exit 1
fi

cat ${FILES[@]} | ${UGLIFY} -o pointerevents.js
