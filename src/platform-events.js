/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1) and mouse events.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = scope.pointermap;
  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend'
    ],
    indexOfTouch: Array.prototype.indexOf.call.bind(Array.prototype.indexOf),
    splitEvents: function(inEvent) {
      var es = Array.prototype.map.call(inEvent.changedTouches, function(inTouch) {
        var e = dispatcher.cloneEvent(inTouch);
        // pointerId starts at 1 for mouse, touch even ids can start at 0
        // move up 2 for compatibility
        e.pointerId = e.identifier + 2;
        e.target = this.findTarget(e);
        e.bubbles = true;
        e.cancelable = true;
        e.which = 1;
        e.button = 0;
        e.isPrimary = this.indexOfTouch(inEvent.touches, inTouch) == 0;
        e.pointerType = 'touch';
        return e;
      }, this);
      return es;
    },
    findTarget: function(inEvent) {
      // TODO (dfreedman): support shadow.elementFromPoint here, when available
      return document.elementFromPoint(inEvent.clientX, inEvent.clientY);
    },
    touchstart: function(inEvent) {
      this.splitEvents(inEvent).forEach(this.overDown, this);
    },
    overDown: function(inTouch) {
      var p = pointermap.addPointer(inTouch.pointerId, inTouch);
      dispatcher.over(inTouch);
      dispatcher.down(inTouch);
      p.out = inTouch;
    },
    touchmove: function(inEvent) {
      // must preventDefault first touchmove or document will scroll otherwise
      // Per Touch event spec section 5.6
      // http://www.w3.org/TR/touch-events/#the-touchmove-event
      inEvent.preventDefault();
      this.splitEvents(inEvent).forEach(this.moveOverOut, this);
    },
    moveEnterLeave: function(inTouch) {
      var event = inTouch;
      var pointer = pointermap.getPointerById(event.pointerId);
      var outEvent = pointer.out;
      pointer.event = event;
      dispatcher.move(event);
      if (outEvent && outEvent.target !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outEvent.target;
        dispatcher.out(outEvent);
        dispatcher.over(event);
      }
      pointer.out = event;
    },
    touchend: function(inEvent) {
      this.splitEvents(inEvent).forEach(this.upOut, this);
    },
    upOut: function(inTouch) {
      dispatcher.up(inTouch);
      dispatcher.out(inTouch);
      pointermap.removePointer(inTouch.pointerId);
    },
  };

  // handler block for native mouse events
  var mouseEvents = {
    // Mouse is required to have a pointerId of 1
    POINTER_ID: 1,
    // Mouse can only count as one pointer ever, so we keep track of the number of
    // mouse buttons held down to keep number of pointerdown / pointerup events
    // correct
    buttons: 0,
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = 'mouse';
      return e;
    },
    mousedown: function(inEvent) {
      if (this.buttons == 0) {
        var e = this.prepareEvent(inEvent);
        pointermap.addPointer(this.POINTER_ID, e);
        dispatcher.down(e);
      }
      this.buttons++;
    },
    mousemove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      var p = pointermap.getPointerById(this.POINTER_ID);
      if (p) {
        p.event = e;
      }
      dispatcher.move(e);
    },
    mouseup: function(inEvent) {
      this.buttons--;
      if (this.buttons == 0) {
        var e = this.prepareEvent(inEvent);
        dispatcher.up(e);
        pointermap.removePointer(this.POINTER_ID);
      }
    },
    mouseover: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.over(e);
    },
    mouseout: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.out(e);
    }
  };

  // only activate if this platform does not have pointer events
  if (window.navigator.pointerEnabled === undefined) {
    // We fork the initialization of dispatcher event listeners here because
    // current native touch event systems emulate mouse events. These
    // touch-emulated mouse events behave differently than normal mouse events.
    //
    // Touch-emulated mouse events will only occur if the target element has
    // either a native click handler, or the onclick attribute is set. In
    // addition, the touch-emulated mouse events fire only after the finger has
    // left the screen, negating any live-tracking ability a developer might want.
    //
    // The only way to disable mouse event emulation by native touch systems is to
    // preventDefault every touch event, which we feel is inelegant.
    //
    // Therefore we choose to only listen to native touch events if they exist.

    if ('ontouchstart' in window) {
      dispatcher.registerSource('touch', touchEvents);
    } else {
      dispatcher.registerSource('mouse', mouseEvents);
    }
    dispatcher.registerTarget(document);
    Object.defineProperty(window.navigator, 'pointerEnabled', {value: true, enumerable: true});
  }
})(window.__PointerEventShim__);
