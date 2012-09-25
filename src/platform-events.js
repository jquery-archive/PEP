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
    splitEvents: function(inEvent) {
      var es = Array.prototype.map.call(inEvent.changedTouches, function(inTouch) {
        var e = dispatcher.cloneEvent(inTouch);
        // pointerId starts at 1 for mouse, touches can start at 0
        // move up 2 for compatibility
        e.pointerId = e.identifier + 2;
        e.target = this.findTarget(e);
        e.bubbles = true;
        e.cancelable = true;
        e.which = 1;
        e.button = 0;
        e.isPrimary = Array.prototype.indexOf.call(inEvent.touches, inTouch) == 0;
        return e;
      }, this);
      return es;
    },
    findTarget: function(inEvent) {
      return document.elementFromPoint(inEvent.clientX, inEvent.clientY);
    },
    touchstart: function(inEvent) {
      var es = this.splitEvents(inEvent);
      es.forEach(this.downEnter, this);
    },
    downEnter: function(inTouch) {
      var p = pointermap.addPointer(inTouch.pointerId, inTouch);
      dispatcher.down(inTouch);
      p.over = inTouch;
      dispatcher.over(inTouch);
    },
    touchmove: function(inEvent) {
      // must preventDefault first touchmove or document will scroll otherwise
      // Per Touch event spec section 5.6
      // http://www.w3.org/TR/touch-events/#the-touchmove-event
      inEvent.preventDefault();
      var es = this.splitEvents(inEvent);
      es.forEach(this.moveEnterLeave, this);
    },
    moveEnterLeave: function(inTouch) {
      var event = inTouch;
      var pointer = pointermap.getPointerById(event.pointerId);
      var overEvent = pointer.over;
      pointer.event = event;
      dispatcher.move(event);
      if (overEvent && overEvent.target !== event.target) {
        overEvent.relatedTarget = event.target;
        event.relatedTarget = overEvent.target;
        dispatcher.over(overEvent);
        dispatcher.enter(event);
      }
      pointer.over = event;
    },
    touchend: function(inEvent) {
      var es = this.splitEvents(inEvent);
      es.forEach(this.upLeave, this);
    },
    upLeave: function(inTouch) {
      dispatcher.up(inTouch);
      dispatcher.out(inTouch);
      pointermap.removePointer(inTouch.pointerId);
    },
  };

  // handler block for native mouse events
  var mouseEvents = {
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
})(window.__PointerEventShim__);
