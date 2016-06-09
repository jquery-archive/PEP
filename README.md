# Pointer Events Polyfill - making pointer events usable today

![PEP logo](pep-logo-shield.png)

PEP polyfills pointer events in all browsers that haven't yet implemented them, providing a unified, responsive input model for all devices and input types. You can [read more about pointer events below](#why-pointer-events).

## Getting Started

1. Place the PEP script in the document head
  - `<script src="https://code.jquery.com/pep/0.4.1/pep.js"></script>`

1. By default, no pointer events are sent from an element. This maximizes the possibility that a browser can deliver smooth scrolling and jank-free gestures. If you want to receive events, you must set the `touch-action` property of that element. Set up some elements to create events with the [`touch-action` attribute](http://www.w3.org/TR/pointerevents/#the-touch-action-css-property).

1. Listen for the desired events
  - `pointermove`: a pointer moves, similar to touchmove or mousemove.
  - `pointerdown`: a pointer is activated, or a device button held.
  - `pointerup`: a pointer is deactivated, or a device button released.
  - `pointerover`: a pointer has moved onto an element.
  - `pointerout`: a pointer is no longer on an element it once was.
  - `pointerenter`: a pointer enters the bounding box of an element.
  - `pointerleave`: a pointer leaves the bounding box of an element.
  - `pointercancel`: a pointer will no longer generate events.

1. As elements come and go, or have their `touch-action` attribute changed, they will send the proper set of pointer events.

```html
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PEP (Pointer Events Polyfill)</title>
  <meta name="viewport" content="width=device-width">
  <!-- include PEP -->
  <script src="https://code.jquery.com/pep/0.4.1/pep.js"></script>
</head>
<body>
<button id="b" touch-action="none">Test button!</button>
<p><output id="o"></output></p>
<script>
document.getElementById( "b" ).addEventListener( "pointerdown", function( e ) {
  document.getElementById( "o" ).innerHTML = "that was a " +
    e.pointerType + " " + e.type + " on a "+ e.target.nodeName;
} );
</script>
</body>
</html>
```

See also the [examples in the W3C Pointer Events Specification](http://www.w3.org/TR/pointerevents/#examples) and our own [samples for using PEP](http://jquery.github.io/PEP/).

### Using PEP with jQuery

You can use pointer events with jQuery and PEP:
```html
<div id="canvas" touch-action="none"></div>
<script src="pep.dist.js"></script>
<script src="jquery.js"></script>
<script>
$("#canvas").on("pointermove", function(event) {
  draw(event);
});
</script>
```
Check out [this jsbin demo](http://jsbin.com/bojumofowa/1/edit?html,css,js,output) for a full demo.

jQuery doesn't copy all properties from the original event object to the event object provided in the event handler. You can find [a list of copied and normalized properties on the jQuery API docs](http://api.jquery.com/category/events/event-object/). To access any other original properties, use `event.originalEvent`.


## Why Pointer Events?

Mouse events and touch events are fundamentally different beasts in browsers today, and that makes it hard to write cross-platform apps.

For example, a simple finger paint app needs plenty of work to behave correctly with mouse and touch:

Current platforms that implement touch events also provide mouse events for backward compatibility; however, only a subset of mouse events are fired and the semantics are changed.

- Mouse events are only fired after the touch sequence ends.
- Mouse events are not fired on elements without a `click` event handler. One must be attached by default, or directly on the element with `onclick`.
- `click` events are not fired if the content of the page changes in a `mousemove` or `mouseover` event.
- `click` events are fired 300ms after the touch sequence ends.
- More information: [Apple Developer Documentation](http://developer.apple.com/library/safari/#documentation/appleapplications/reference/safariwebcontent/HandlingEvents/HandlingEvents.html).

Additionally, touch events are sent only to the element that received the `touchstart`. This is fundamentally different than mouse events, which fire on the element that is under the mouse. To make them behave similarly, touch events need to be retargeted with `document.elementFromPoint`.

These incompatibilities lead to applications having to listen to 2 sets of events, mouse on desktop and touch for mobile.

**This forked interaction experience is cumbersome and hard to maintain.**

Instead, there should exist a set of events that are normalized such that they behave exactly the same, no matter the source: touch, mouse, stylus, skull implant, etc. To do this right, this normalized event system needs to be available for all the web platform to use.

*Thus, Pointer Events!*

## Polyfill Limitations

### touch-action

According to the spec, the
[touch-action](http://www.w3.org/TR/pointerevents/#the-touch-action-css-property) CSS property controls whether an element will perform a "default action" such as scrolling, or receive a continuous stream of pointer events.

Due to the difficult nature of polyfilling new CSS properties, this library will use a touch-action *attribute* instead. In addition, run time changes involving the `touch-action` attribute will be monitored for maximum flexibility.

Touches will not generate events unless inside of an area that has a valid `touch-action` attribute defined. This is to maintain composition scrolling optimizations where possible.

### Browser Compatibility

PEP should work on IE 10+ and the latest versions of Chrome, Safari, Firefox, and Opera. In any [browser implementing pointer events natively](http://caniuse.com/#feat=pointer) (detected by checking for `window.PointerEvent`), PEP won't do anything.

## Building PEP

If you want to build PEP yourself from source, you'll need to install [Node.js](https://nodejs.org/en/download/) and run the following commands:

```sh
# Install all dependencies
npm install

# Build PEP
npm run build
```

When the build completes, the generated files will be available in the `dist/` directory.

*NOTE: Running the demos requires building PEP.*
