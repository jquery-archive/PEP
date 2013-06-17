/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function (scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

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
    global: [
      'mousedown',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    lastTouches: [],
    // duplicate, so a user can do dispatcher.registerTarget(document), and not
    // collide with the global mouse listener
    mouseHandler: dispatcher.eventHandler.bind(dispatcher),
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX, y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.has(this.POINTER_ID);
        // TODO(dfreedman) workaround for some elements not sending mouseup
        // http://crbug/149091
        if (p) {
          this.cancel(inEvent);
          p = false;
        }
        if (!p) {
          var e = this.prepareEvent(inEvent);
          pointermap.set(this.POINTER_ID, inEvent);
          dispatcher.down(e);
          dispatcher.listen(this.global, document, this.mouseHandler);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        if (p && p.button === inEvent.button) {
          var e = this.prepareEvent(inEvent);
          dispatcher.up(e);
          this.cleanupMouse();
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanupMouse();
    },
    cleanupMouse: function() {
      pointermap.delete(this.POINTER_ID);
      dispatcher.unlisten(this.global, document, this.mouseHandler);
    }
  };

  // mouse move events must be on at all times
  dispatcher.listen(['mousemove'], document, dispatcher.boundHandler);

  scope.mouseEvents = mouseEvents;
})(window.PointerEventsPolyfill);
