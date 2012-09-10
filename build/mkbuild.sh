#!/bin/bash
FILES=(
  '../src/initialize.js'
  '../src/pointermap.js'
  '../src/dispatcher.js'
  '../src/platform-events.js'
  '../src/flick.js'
  '../src/finalize.js'
)

cat ${FILES[@]} | uglifyjs -o pointerevents.js
