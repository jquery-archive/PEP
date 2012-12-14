/*!
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1), mouse events, and MSPointerEvents.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var installer = scope.installer;
  var pointermap = dispatcher.pointermap;
  var touchMap = Array.prototype.map.call.bind(Array.prototype.map);
  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {
      if (this.firstTouch === null) {
        this.firstTouch = inTouch.identifier;
      }
    },
    removePrimaryTouch: function(inTouch) {
      if (this.isPrimaryTouch(inTouch)) {
        this.firstTouch = null;
      }
    },
    touchToPointer: function(inTouch) {
      var e = dispatcher.cloneEvent(inTouch);
      // Spec specifies that pointerId 1 is reserved for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      e.pointerId = inTouch.identifier + 2;
      e.target = this.findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.button = 0;
      e.buttons = 1;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      var pointers = touchMap(tl, this.touchToPointer, this);
      pointers.forEach(inFunction, this);
    },
    findTarget: function(inEvent) {
      // TODO (dfreedman): support shadow.elementFromPoint here, when available
      return document.elementFromPoint(inEvent.clientX, inEvent.clientY) || document;
    },
    touchstart: function(inEvent) {
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.processTouches(inEvent, this.overDown);
    },
    overDown: function(inPointer) {
      var p = pointermap.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      dispatcher.over(inPointer);
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      // must preventDefault first touchmove or document will scroll otherwise
      // Per Touch event spec section 5.6
      // http://www.w3.org/TR/touch-events/#the-touchmove-event
      inEvent.preventDefault();
      this.processTouches(inEvent, this.moveOverOut);
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = pointermap.get(event.pointerId);
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;
        // recover from retargeting by shadow
        outEvent.target = outTarget;
        dispatcher.out(outEvent);
        dispatcher.over(event);
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      dispatcher.up(inPointer);
      dispatcher.out(inPointer);
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      dispatcher.cancel(inPointer);
      dispatcher.out(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      pointermap.delete(inPointer.pointerId);
      this.removePrimaryTouch(inPointer);
    }
  };

  // handler block for native mouse events
  var mouseEvents = {
    // Mouse is required to have a pointerId of 1
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
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
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    mousedown: function(inEvent) {
      if (!pointermap.has(this.POINTER_ID)) {
        var e = this.prepareEvent(inEvent);
        var p = pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.down(e);
      }
    },
    mousemove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    mouseup: function(inEvent) {
      var p = pointermap.get(this.POINTER_ID);
      if (p && p.button === inEvent.button) {
        var e = this.prepareEvent(inEvent);
        dispatcher.up(e);
        pointermap.delete(this.POINTER_ID);
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

  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel'
    ],
    POINTER_TYPES: [
      'NOT USED',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      return e;
    },
    MSPointerDown: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.up(e);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.out(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.over(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
    }
  };

  // only activate if this platform does not have pointer events
  if (window.navigator.pointerEnabled === undefined) {

    if (window.navigator.msPointerEnabled) {
      var tp = window.navigator.msMaxTouchPoints;
      if (tp !== undefined) {
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
      }
      dispatcher.registerSource('ms', msEvents);
      dispatcher.registerTarget(document);
    } else {
      dispatcher.registerSource('mouse', mouseEvents);
      // mouse events must be on at all times
      dispatcher.listen(mouseEvents.events, document);
      if ('ontouchstart' in window) {
        dispatcher.registerSource('touch', touchEvents);
      }
      installer.enableOnSubtree(document);
    }

    Object.defineProperty(window.navigator, 'pointerEnabled', {value: true, enumerable: true});
  }
})(window.__PointerEventShim__);
