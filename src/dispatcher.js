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
    events: [],
    eventMap: {},
    /*
     * Scope objects for native events.
     * This exists for ease of testing.
     */
    eventSources: {},
    // add a new event source
    registerSource: function(inName, inScope) {
      this.events = inScope.events;
      this.events.forEach(function(e) {
        if (inScope[e]) {
          this.eventMap[e] = inScope[e].bind(inScope);
        }
      }, this);
      this.eventSources[inName] = inScope;
    },
    // add event listeners for inTarget
    registerTarget: function(inTarget) {
      this.listen(this.events, inTarget);
    },
    // remove event listeners for inTarget
    unregisterTarget: function(inTarget) {
      this.unlisten(this.events, inTarget);
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
      /*
       * __pointerHandled__ is used to prevent multiple dispatch of
       * pointerevents from platform events. This can happen when two elements
       * in different scopes are set up to create pointer events, which is
       * relevant to Shadow DOM.
       */
      if (inEvent.__pointerHandled__) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent.__pointerHandled__ = true;
    },
    // set up event listeners
    listen: function(inEvents, inTarget) {
      inEvents.forEach(function(e) {
        this.addEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    // remove event listeners
    unlisten: function(inEvents) {
      inEvents.forEach(function(e) {
        this.removeEvent(e, this.boundHandler, false, inTarget);
      }, this);
    },
    addEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.addEventListener(inEventName, inEventHandler, inCapture);
    },
    removeEvent: function(inEventName, inEventHandler, inCapture, inTarget) {
      inTarget.removeEventListener(inEventName, inEventHandler, inCapture);
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
      e.__srcTarget__ = inEvent.__srcTarget__ || inEvent.target;
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
    // dispatch events
    dispatchEvent: function(inEvent) {
      return inEvent.__srcTarget__.dispatchEvent(inEvent);
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  scope.dispatcher = dispatcher;
  /*
   * convenience function for users to register targets that may be out of the
   * scope of document
   */
  scope.register = function(inTarget) {
    dispatcher.registerTarget(inTarget);
  };
  /*
   * convenience function for users to unregister targets that may be out of the
   * scope of document
   */
  scope.unregister = function(inTarget) {
    dispatcher.unregisterTarget(inTarget);
  };
})(window.__PointerEventShim__);
