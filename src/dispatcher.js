/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module is for normalizing events. Mouse and Touch events will be
 * collected here, and fire PointerEvents that have the same semantics, no
 * matter the source.
 * Events fired:
 *   - pointerdown: a pointing is added
 *   - pointerup: a pointer is removed
 *   - pointermove: a pointer is moved
 *   - pointerover: a pointer crosses into an element
 *   - pointerout: a pointer leaves an element
 *   - pointercancel: a pointer will no longer generate events
 */
(function(scope) {
  var dispatcher = {
    POINTER_TYPE_UNAVAILABLE: 'unavailable',
    POINTER_TYPE_TOUCH: 'touch',
    POINTER_TYPE_PEN: 'pen',
    POINTER_TYPE_MOUSE: 'mouse',
    targets: new SideTable('target'),
    handledEvents: new SideTable('pointer'),
    events: [],
    eventMap: {},
    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: {},
    /**
     * Add a new event source that will generate pointer events.
     * @param {string} inName A name for the event source
     * @param {Object} inSource A new source of platform events. inSource must
     *   contain an array of event names named 'events', and functions with the
     *   names specified in the 'events' array.
     */
    registerSource: function(inName, inSource) {
      var s = inSource;
      this.events = s.events;
      this.events.forEach(function(e) {
        if (s[e]) {
          this.eventMap[e] = s[e].bind(s);
        }
      }, this);
      this.eventSources[inName] = s;
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
      this.fireEvent('pointerdown', inEvent)
    },
    move: function(inEvent) {
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      this.fireEvent('pointerenter', inEvent)
    },
    leave: function(inEvent) {
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      this.fireEvent('pointerover', inEvent)
    },
    out: function(inEvent) {
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      this.fireEvent('pointercancel', inEvent);
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
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
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {
      // According to the w3c spec,
      // http://www.w3.org/TR/DOM-Level-3-Events/#events-MouseEvent-button
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
      this.targets.set(e, this.targets.get(inEvent) || inEvent.target);
      /**
       * Add readonly properties to an event
       * @param {Event} inEvent The event to add properties to.
       * @param {Object} inProps A mapping of property names to values
       */
      this.setEventProperties(e, {
        pointerId: inEvent.pointerId,
        width: inEvent.width || 0,
        height: inEvent.height || 0,
        pressure: inEvent.pressure || 0,
        tiltX: inEvent.tiltX || 0,
        tiltY: inEvent.tiltY || 0,
        pointerType: inEvent.pointerType || this.POINTER_TYPE_UNAVAILABLE,
        hwTimestamp: inEvent.hwTimestamp || 0,
        isPrimary: inEvent.isPrimary || false
      });
      return e;
    },
    /**
     * Add readonly properties to an event
     * @param {Event} inEvent The event to add properties to.
     * @param {Object} inProps A mapping of property names to values.
     */
    setEventProperties: function(inEvent, inProps) {
      var d = {};
      for (var p in inProps) {
        d[p] = {value: inProps[p], enumerable: true};
      }
      Object.defineProperties(inEvent, d);
    },
    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = {};
      for (var n in inEvent) {
        eventCopy[n] = inEvent[n];
      }
      return eventCopy;
    },
    // TODO (dfreedman): Implement pointer capturing
    getTarget: function(inEvent) {
      // if pointer capture is set, route all events for the specified pointerId
      // to the capture target
      if (this.captureInfo) {
        if (this.captureInfo.id === inEvent.pointerId) {
          return this.captureInfo.target;
        }
      }
      return this.targets.get(inEvent);
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  scope.dispatcher = dispatcher;
  /**
   * Convenience function for users to register targets that may be out of the
   * scope of document.
   *
   * @param {Element} InTarget A scope that will create and route PointerEvents
   */
  scope.register = function(inTarget) {
    dispatcher.registerTarget(inTarget);
  };
  /**
   * Convenience function for users to unregister targets that may be out of the
   * scope of document.
   *
   * @param {Element} InTarget A scope created and routed PointerEvents
   */
  scope.unregister = function(inTarget) {
    dispatcher.unregisterTarget(inTarget);
  };
})(window.__PointerEventShim__);
