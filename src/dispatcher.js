/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
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
    targets: new SideTable('target'),
    handledEvents: new SideTable('pointer'),
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
       * This is used to prevent multiple dispatch of
       * pointerevents from platform events. This can happen when two elements
       * in different scopes are set up to create pointer events, which is
       * relevant to Shadow DOM.
       */
      if (this.handledEvents.get(inEvent)) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      this.handledEvents.set(inEvent, true);
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
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {Event} inEvent A platform event with a target
     * @param {string} inType A string representing the type of event to create
     * @return {Event} A Gesture event of type `inType`
     */
    makeEvent: function(inEvent, inType) {
      // According to the w3c spec,
      // http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-MouseEvent
      // MouseEvent.button == 0 can mean either no mouse button depressed, or
      // the left mouse button depressed.
      //
      // As of now, the only way to distinguish between the two states of
      // MouseEvent.button is by using the deprecated MouseEvent.which property,
      // as this maps mouse buttons to positive integers > 0, and uses 0 to mean
      // that no mouse button is held.
      //
      // MouseEvent.which is derived from MouseEvent.button at MouseEvent
      // creation, but initMouseEvent does not expose an argument with which to
      // set MouseEvent.which. Calling initMouseEvent with a buttonArg of 0 will
      // set MouseEvent.button == 0 and MouseEvent.which == 1, breaking the
      // expectations of app developers.
      //
      // The only way to propagate the correct state of MouseEvent.which and
      // MouseEvent.button to a new MouseEvent.button == 0 and MouseEvent.which == 0
      // is to call initMouseEvent with a buttonArg value of -1.
      //
      // For user agents implementing DOM Level 3 events, Event.buttons has to
      // be used instead, which is a bitmap of depressed buttons.
      var b;
      if (inEvent.buttons === undefined) {
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
      // TODO(dfreedman): do these properties need to be readonly?
      this.targets.set(e, this.targets.get(inEvent) || inEvent.target);
      e.pointerId = inEvent.pointerId || -1;
      e.getPointerList = getPointerList;
      return e;
    },
    fireEvent: function(inEvent, inType) {
      var e = this.makeEvent(inEvent, inType);
      return this.dispatchEvent(e);
    },
    // returns a snapshot of inEvent, so properties are malleable
    cloneEvent: function(inEvent) {
      var eventCopy = {};
      for (var n in inEvent) {
        eventCopy[n] = inEvent[n];
      }
      return eventCopy;
    },
    // dispatch events
    dispatchEvent: function(inEvent) {
      var t = this.targets.get(inEvent);
      return t.dispatchEvent(inEvent);
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  scope.dispatcher = dispatcher;
  /**
   * Convenience function for users to register targets that may be out of the
   * scope of document.
   *
   * @param {Element} InTarget A scope that will create and route gesture events
   */
  scope.register = function(inTarget) {
    dispatcher.registerTarget(inTarget);
  };
  /**
   * Convenience function for users to unregister targets that may be out of the
   * scope of document.
   *
   * @param {Element} InTarget A scope created and routed gesture events
   */
  scope.unregister = function(inTarget) {
    dispatcher.unregisterTarget(inTarget);
  };
})(window.__PointerEventShim__);
