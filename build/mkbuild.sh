#!/bin/bash
UGLIFY='../third_party/uglifyjs/bin/uglifyjs'
OUTPUT='pointerevents.js'
FILES=(
  '../src/PointerEvent.js'
  '../src/sidetable.js'
  '../src/initialize.js'
  '../src/pointermap.js'
  '../src/dispatcher.js'
  '../src/installer.js'
  '../src/platform-events.js'
)

if [[ ! -x $UGLIFY ]]; then
cat <<EOF
Please run 'git submodule update --init' from the top level of the repository to
check out uglifyjs for the build process
EOF
exit 1
fi
${UGLIFY} ../third_party/mutation_summary/mutation_summary.js > $OUTPUT
echo >> $OUTPUT
head -n 5 <../src/pointerevents.js >> $OUTPUT
cat ${FILES[@]} | ${UGLIFY} -nc >> $OUTPUT
