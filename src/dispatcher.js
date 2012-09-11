/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/*
 * This module is for normalizing events. Mouse and Touch events will be
 * collected here, and fire Pointer events that have the same semantics, no
 * matter the source. We hope that eventually a system like this one will be
 * standard and available from the platform.
 * Events fired:
 *   - pointertap: click
 *   - pointerdown: a pointing is added
 *   - pointerup: a pointer is removed
 *   - pointermove: a pointer is moved
 *   - pointerenter: a pointer enters the boundaries of an element
 *   - pointerleave: a pointer leaves the boundaries of an element
 */
(function(scope) {
  var clone = scope.clone;
  var pointermap = scope.pointermap;
  var getPointerList = pointermap.getPointerList.bind(pointermap);
  var dispatcher = {
    /*
     * Hooks are event handlers that use pointer events and create different pointer events.
     * Hooks are called before the base pointer events are dispatched, and have
     * the ability to cancel the dispatch by returning true.
     *
     * Hooks are how rich gesture events are created: by listening to normalized
     * pointer events, gesture code can be much simpler.
     *
     * Users can add custom hooks with `registerHook` to create new pointer events.
     */
    hooks: [],
    // native platform events being listened for
    events: {},
    /*
     * Scope objects for native events.
     * This exists for ease of testing.
     */
    eventSources: {},
    // add a new event source and listen for those events
    registerSource: function(inName, inScope, inEvents) {
      inEvents.forEach(function(e) {
        if (inScope[e]) {
          this.events[e] = inScope[e].bind(inScope);
        }
      }, this);
      this.listen(inEvents);
      this.eventSources[inName] = inScope;
    },
    // add a new event module that needs pointer events
    registerHook: function(inName, inScope, inEvents) {
      this.hooks.push({scope: inScope, events: inEvents, name: inName});
    },
    // EVENTS
    down: function(inEvent) {
      this.fireEvent(inEvent, 'pointerdown')
    },
    move: function(inEvent) {
      this.fireEvent(inEvent, 'pointermove');
    },
    up: function(inEvent) {
      this.fireEvent(inEvent, 'pointerup');
    },
    tap: function(inEvent) {
      if (!this.disableTap) {
        this.fireEvent(inEvent, 'pointertap');
      }
    },
    enter: function(inEvent) {
      this.fireEvent(inEvent, 'pointerenter')
    },
    leave: function(inEvent) {
      this.fireEvent(inEvent, 'pointerleave');
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      var type = inEvent.type;
      var fn = this.events && this.events[type];
      if (fn) {
        fn(inEvent);
      }
    },
    // set up event listeners
    listen: function(inEvents) {
      inEvents.forEach(function(e) {
        this.addEvent(e, this.boundHandler);
      }, this);
    },
    // remove event listeners
    unlisten: function(inEvents) {
      inEvents.forEach(function(e) {
        this.removeEvent(e, this.boundHandler);
      }, this);
    },
    addEvent: function(inEventName, inEventHandler, inCapture) {
      document.addEventListener(inEventName, inEventHandler, inCapture);
    },
    removeEvent: function(inEventName, inEventHandler, inCapture) {
      document.removeEventListener(inEventName, inEventHandler, inCapture);
    },
    // EVENT CREATION AND TRACKING
    makeEvent: function(inEvent, inType) {
      /*
       * According to the w3c spec,
       * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-MouseEvent
       * MouseEvent.button == 0 can mean either no mouse button depressed, or
       * the left mouse button depressed.
       *
       * As of now, the only way to distinguish between the two states of
       * MouseEvent.button is by using the deprecated MouseEvent.which property,
       * as this maps mouse buttons to positive integers > 0, and uses 0 to mean
       * that no mouse button is held.
       *
       * MouseEvent.which is derived from MouseEvent.button at MouseEvent
       * creation, but initMouseEvent does not expose an argument with which to
       * set MouseEvent.which. Calling initMouseEvent with a buttonArg of 0 will
       * set MouseEvent.button == 0 and MouseEvent.which == 1, breaking the
       * expectations of app developers.
       *
       * The only way to propagate the correct state of MouseEvent.which and
       * MouseEvent.button to a new MouseEvent.button == 0 and MouseEvent.which == 0
       * is to call initMouseEvent with a buttonArg value of -1.
       *
       * For user agents implementing DOM Level 3 events, Event.buttons has to
       * be used instead, which is a bitmap of depressed buttons.
       */
      var b;
      if (typeof inEvent.buttons !== 'undefined') {
        b = inEvent.buttons ? inEvent.button : -1;
      } else {
        b = inEvent.which ? inEvent.button : -1;
      }
      var e = document.createEvent('MouseEvent');
      e.initMouseEvent(inType, inEvent.bubbles, inEvent.cancelable,
                       inEvent.view, inEvent.detail, inEvent.screenX,
                       inEvent.screenY, inEvent.clientX, inEvent.clientY,
                       inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey,
                       inEvent.metaKey, b, inEvent.relatedTarget);
      // TODO(dfreedm) do these properties need to be readonly?
      e.srcEvent = inEvent.srcEvent || inEvent;
      e.pointerId = inEvent.pointerId || -1;
      e.getPointerList = getPointerList;
      return e;
    },
    fireEvent: function(inEvent, inType) {
      var e = this.makeEvent(inEvent, inType);
      return this.dispatchEvent(e);
    },
    cloneEvent: function(inEvent) {
      return clone({}, inEvent);
    },
    findTarget: function(inEvent) {
      return inEvent.target;
    },
    // dispatch events
    dispatchEvent: function(inEvent) {
      var et = inEvent.type;
      for (var i = 0, h, fn; (h = this.hooks[i]); i++) {
        if (h.events.indexOf(et) > -1) {
          fn = h.scope[et];
          // if a hook for this event returns true, do not dispatch
          if (fn && fn.call(h.scope, inEvent) === true) {
            return;
          }
        }
      }
      return this.findTarget(inEvent.srcEvent).dispatchEvent(inEvent);
    }
  };
  scope.dispatcher = dispatcher;
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
})(window.__PointerEventShim__);
