#!/bin/bash
FILES=(
  '../src/initialize.js'
  '../src/pointermap.js'
  '../src/dispatcher.js'
  '../src/platform-events.js'
  '../src/flick.js'
  '../src/finalize.js'
)

cat ${FILES[@]} | ../third_party/uglifyjs/bin/uglifyjs -o pointerevents.js
