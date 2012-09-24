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
  // returns true if a === b or a is inside b
  var isDescendant = function(inA, inB) {
    var a = inA;
    while(a) {
      if (a === inB) {
        return true;
      }
      a = a.parentNode;
    }
  };
  // handler block for native touch events
  var touchEvents = {
    events: [
      'click',
      'touchstart',
      'touchmove',
      'touchend'
    ],
    splitEvents: function(inEvent) {
      var es = Array.prototype.map.call(inEvent.changedTouches, function(inTouch) {
        var e = dispatcher.cloneEvent(inTouch);
        e.pointerId = inTouch.identifier;
        e.target = this.findTarget(e);
        e.bubbles = true;
        e.cancelable = true;
        e.which = 1;
        e.button = 0;
        return e;
      }, this);
      return es;
    },
    findTarget: function(inEvent) {
      return document.elementFromPoint(inEvent.clientX, inEvent.clientY);
    },
    // TODO(dfreedman): should click even be here, or watch up/down pairs for tap?
    click: function(inEvent) {
      dispatcher.tap(inEvent);
    },
    touchstart: function(inEvent) {
      var es = this.splitEvents(inEvent);
      es.forEach(this.downEnter, this);
    },
    downEnter: function(inTouch) {
      var p = pointermap.addPointer(inTouch.pointerId, inTouch, null);
      dispatcher.down(inTouch);
      p.over = inTouch;
      dispatcher.enter(inTouch);
    },
    touchmove: function(inEvent) {
      /*
       * must preventDefault first touchmove or document will scroll otherwise
       * Per Touch event spec section 5.6
       * http://www.w3.org/TR/touch-events/#the-touchmove-event
       */
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
        if (!isDescendant(overEvent.relatedTarget, overEvent.target)) {
          dispatcher.leave(overEvent);
        }
        if (!isDescendant(event.relatedTarget, event.target)) {
          dispatcher.enter(event);
        }
      }
      pointer.over = event;
    },
    touchend: function(inEvent) {
      var es = this.splitEvents(inEvent);
      es.forEach(this.upLeave, this);
    },
    upLeave: function(inTouch) {
      dispatcher.up(inTouch);
      dispatcher.leave(inTouch);
      pointermap.removePointer(inTouch.pointerId);
    },
  };

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: -1,
    // Mouse can only count as one pointer ever, so we keep track of the number of
    // mouse buttons held down to keep number of pointerdown / pointerup events
    // correct
    buttons: 0,
    events: [
      'click',
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    click: function(inEvent) {
      dispatcher.tap(inEvent);
    },
    mousedown: function(inEvent) {
      // Right mouse button does not fire up events in some user agents
      if (inEvent.button == 2) {
        return;
      }
      if (this.buttons == 0) {
        pointermap.addPointer(this.POINTER_ID, inEvent);
        dispatcher.down(inEvent);
      }
      this.buttons++;
    },
    mousemove: function(inEvent) {
      var p = pointermap.getPointerById(this.POINTER_ID);
      if (p) {
        p.event = inEvent;
      }
      dispatcher.move(inEvent);
    },
    mouseup: function(inEvent) {
      this.buttons--;
      if (this.buttons == 0) {
        dispatcher.up(inEvent);
        pointermap.removePointer(this.POINTER_ID);
      }
    },
    mouseover: function(inEvent) {
      if (!isDescendant(inEvent.relatedTarget, inEvent.target)) {
        var e = dispatcher.cloneEvent(inEvent);
        e.bubbles = false;
        dispatcher.enter(e);
      }
    },
    mouseout: function(inEvent) {
      if (!isDescendant(inEvent.relatedTarget, inEvent.target)) {
        var e = dispatcher.cloneEvent(inEvent);
        e.bubbles = false;
        dispatcher.leave(e);
      }
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
