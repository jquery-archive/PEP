/*
  This module is for normalizing events.
  Mouse and Touch events will be collected here, and fire Pointer events that have the same semantics, no matter the source.
  We hope that eventually a system like this one will be standard and available from the platform.
  Events fired:
    - pointertap: click
    - pointerdown: mousedown / touchstart
    - pointerup: mouseup / touchend
    - pointermove: mousemove / touchmove
    - pointerenter: mouseover / synthed from touchmove + touchstart
    - pointerleave: mouseout / synthed from touchmove + touchend
    - pointerscroll: mousescroll
*/
(function(scope) {
  var boundHandler;
  var dispatcher = {
    hooks: [],
    addHook: function(inScope, inEvents, inName) {
      this.hooks.push({scope: inScope, events: inEvents, name: inName});
    },
    get events() {
      return this._events;
    },
    set events(inEvents) {
      this.unlisten(this.events);
      this.listen(inEvents);
      this._events = inEvents;
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
      this.fireEvent(inEvent, "pointerenter")
    },
    leave: function(inEvent) {
      this.fireEvent(inEvent, "pointerleave");
    },
    scroll: function(inEvent) {
      this.fireEvent(inEvent, "pointerscroll");
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      var type = inEvent.type;
      var fn = this.events[type];
      if (fn) {
        fn(inEvent);
      }
    },
    listen: function(inEvents) {
      // set up event listeners
      for (var e in inEvents) {
        this.addEvent(e, boundHandler);
      }
    },
    unlisten: function(inEvents) {
      // remove event listeners
      for (var e in inEvents) {
        this.removeEvent(e, boundHandler);
      }
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
       * inEvent.button is horribly broken.
       * A falsey button value in the initMouseEvent will set which to 1, because button 0 means left button held
       * However, mouse events can have button == 0 and which == 0
       * Therefore, we use inEvent.button iff which is 1, or we use -1, as this leaves which = 0;
       */
      var b = inEvent.which ? inEvent.button : -1;
      var e = document.createEvent("MouseEvent");
      e.initMouseEvent(inType, inEvent.bubbles, inEvent.cancelable, inEvent.view, inEvent.detail, inEvent.screenX, inEvent.screenY, inEvent.clientX, inEvent.clientY, inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey, inEvent.metaKey, b, inEvent.relatedTarget);
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
  boundHandler = dispatcher.eventHandler.bind(dispatcher);
})(window.PointerEventShim);
