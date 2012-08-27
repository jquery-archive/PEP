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
  *   - pointerscroll: a pointer is scrolling
  */
(function(scope) {
  var dispatcher = {
    hooks: [],
    events: {},
    eventSources: {},
    registerSource: function(inName, inScope, inEvents) {
      inEvents.forEach(function(e) {
        if (inScope[e]) {
          this.events[e] = inScope[e].bind(inScope);
        }
      }.bind(this));
      this.listen(inEvents);
      this.eventSources[inName] = inScope;
    },
    registerHook: function(inName, inScope, inEvents) {
      this.hooks.push({scope: inScope, events: inEvents, name: inName});
    },
    // EVENTS
    down: function(inEvent) {
      this.fireEvent(inEvent, "pointerdown")
    },
    move: function(inEvent) {
      this.fireEvent(inEvent, "pointermove");
    },
    up: function(inEvent) {
      this.fireEvent(inEvent, "pointerup");
    },
    tap: function(inEvent) {
      if (!this.disableTap) {
        this.fireEvent(inEvent, "pointertap");
      }
    },
    enter: function(inEvent) {
      this.fireEvent(e, "pointerenter")
    },
    leave: function(inEvent) {
      this.fireEvent(e, "pointerleave");
    },
    scroll: function(inEvent) {
      this.fireEvent(inEvent, "pointerscroll");
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      var type = inEvent.type;
      var fn = this.events && this.events[type];
      if (fn) {
        fn(inEvent);
      }
    },
    listen: function(inEvents) {
      // set up event listeners
      inEvents.forEach(function(e) {
        this.addEvent(e, this.boundHandler);
      }.bind(this));
    },
    unlisten: function(inEvents) {
      // remove event listeners
      inEvents.forEach(function(e) {
        this.removeEvent(e, this.boundHandler);
      }.bind(this));
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
       * inEvent.button is horribly broken. A falsey button value in the
       * initMouseEvent will set which to 1, because button 0 means left button
       * held However, mouse events can have button == 0 and which == 0
       * Therefore, we use inEvent.button iff which is 1, or we use -1, as this
       * leaves which = 0;
       */
      var b = inEvent.which ? inEvent.button : -1;
      var e = document.createEvent("MouseEvent");
      e.initMouseEvent(inType, inEvent.bubbles, inEvent.cancelable,
                       inEvent.view, inEvent.detail, inEvent.screenX,
                       inEvent.screenY, inEvent.clientX, inEvent.clientY,
                       inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey,
                       inEvent.metaKey, b, inEvent.relatedTarget);
      e.srcEvent = inEvent.srcEvent || inEvent;
      return e;
    },
    fireEvent: function(inEvent, inType) {
      var e = this.makeEvent(inEvent, inType);
      return this.dispatchEvent(e);
    },
    cloneEvent: function(inEvent) {
      return scope.clone({}, inEvent);
    },
    // override this for more interesting event targeting
    findTarget: function(inEvent) {
      return inEvent.target;
    },
    dispatchEvent: function(inEvent) {
      var et = inEvent.type;
      for (var i = 0, h, fn; h = this.hooks[i]; i++) {
        if (h.events.indexOf(et) > -1) {
          fn = h.scope[et];
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
})(window.PointerEventShim);
