## Learn the tech

### Why Pointer Events?

Mouse Events and Touch Events are fundamentally different beasts in browsers today, and that makes it hard to write cross-platform apps.

For example, a simple finger paint app needs plenty of work to behave correctly with mouse and touch:

Current platforms that implement touch events also provide mouse events for backward compatibility; however, only a subset of Mouse Events are fired and the semantics are changed.

- Mouse Events are only fired after the touch sequence ends.
- Mouse Events are not fired on elements without a `click` event handler. One must be attached by default, or directly on the element with `onclick`.
- `click` events are not fired if the content of the page changes in a `mousemove` or `mouseover` event.
- `click` events are fired 300ms after the touch sequence ends.
- More information: [Apple Developer Documentation](http://developer.apple.com/library/safari/#documentation/appleapplications/reference/safariwebcontent/HandlingEvents/HandlingEvents.html).

Additionally, Touch Events are sent only to the element that received the `touchstart`. This is fundamentally different than Mouse Events, which fire on the element that is under the mouse. To make them behave similarly, Touch Events need to be retargeted with `document.elementFromPoint`.

These incompatibilities lead to applications having to listen to 2 sets of events, mouse on desktop and touch for mobile.

**This forked interaction experience is cumbersome and hard to maintain.**

Instead, there should exist a set of events that are normalized such that they behave exactly the same, no matter the source: touch, mouse, stylus, skull implant, etc. To do this right, this normalized event system needs to be available for all the web platform to use.

*Thus, Pointer Events!*

### Basic Usage

By default, no Pointer Events are sent from an element. This maximizes possibility that a browser can deliver smooth scrolling and jank-free gestures. If you want to receive events, you must set the `touch-action` property of that element.

1. Set up some elements to create events with the `touch-action` attribute
  - `<div id="not-a-scroller" touch-action="none"></div>`
      - Generates events all the time, will not scroll
  - `<div id="horizontal-scroller" touch-action="pan-x">`
      - Generates events in the y axis, scrolls in the x axis
  - `<div id="vertical-scroller" touch-action="pan-y">`
      - Generates events in the x axis, scrolls in the y axis
  - `<div id="all-axis-scroller" touch-action="pan-x pan-y">`
      - Generates events only when tapping, scrolls otherwise
      - Can also have the value `pan-y pan-x` or `scroll`

1. Listen for the desired events
  - `pointermove`: a pointer moves, similar to touchmove or mousemove.
  - `pointerdown`: a pointer is activated, or a device button held.
  - `pointerup`: a pointer is deactivated, or a device button released.
  - `pointerover`: a pointer has moved onto an element.
  - `pointerout`: a pointer is no longer on an element it once was.
  - `pointerenter`: a pointer enters the bounding box of an element.
  - `pointerleave`: a pointer leaves the bounding box of an element.
  - `pointercancel`: a pointer will no longer generate events.

1. As elements come and go, or have their `touch-action` attribute changed, they will send the proper set of Pointer Events.

## Polyfill Details

### Getting Started

1. Place the PEP script in the document head
  - `<script src="https://code.jquery.com/pep/0.3.0/pep.js"></script>`
1. Set up your event listeners
1. You're done!

### Samples

Check out some of the samples at http://jquery.github.io/PEP/.

## Polyfill Limitations

### touch-action

According to the spec, the
[touch-action](http://www.w3.org/TR/pointerevents/#the-touch-action-css-property) CSS property controls whether an element will perform a "default action" such as scrolling, or receive a continuous stream of Pointer Events.

Due to the difficult nature of polyfilling new CSS properties, this library will use a touch-action *attribute* instead. In addition, run time changes involving the `touch-action` attribute will be monitored for maximum flexibility.

Touches will not generate events unless inside of an area that has a valid `touch-action` attribute defined. This is to maintain compositiong scrolling optimizations where possible.

### Browser Compatibility

PEP should work on IE 10+ and the latest versions of Chrome, Safari, Firefox, and Opera.
