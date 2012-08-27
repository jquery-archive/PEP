/*
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1) and mouse events.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
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
      "click",
      "touchstart",
      "touchmove",
      "touchend"
    ],
    //TODO(dfreedm) make this actually split touch event into individuals
    splitEvents: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent.changedTouches[0]);
      e.target = this.findTarget(e);
      return [e];
    },
    findTarget: function(inEvent) {
      return document.elementFromPoint(inEvent.clientX, inEvent.clientY);
    },
    click: function(inEvent) {
      dispatcher.tap(inEvent);
    },
    touchstart: function(inEvent) {
      var es = this.splitEvents(inEvent);
      for (var i = 0, e; e = es[i]; i++) {
        dispatcher.down(e);
        //TODO (dfreedm) set up a registry for overEvents?
        this.overEvent = e;
        dispatcher.enter(e);
      }
    },
    touchmove: function(inEvent) {
      /*
       * must preventDefault first touchmove or document will scroll otherwise
       * Per Touch event spec section 5.6
       * http://www.w3.org/TR/touch-events/#the-touchmove-event
       */
      inEvent.preventDefault();
      var es = this.splitEvents(inEvent);
      for (var i = 0, e; e = es[i]; i++) {
        //TODO (dfreedm) needs refactor for multiple overEvents
        dispatcher.move(e);
        if (this.overEvent && this.overEvent.target !== e.target) {
          this.overEvent.relatedTarget = e.target;
          e.relatedTarget = this.overEvent.target;
          if (isDescendant(this.overEvent.target, e.target)) {
            dispatcher.leave(this.overEvent);
          }
          if (isDescendant(e.target, this.overEvent.target)) {
            dispatcher.enter(e);
          }
        }
        this.overEvent = e;
      }
    },
    touchend: function(inEvent) {
      var es = this.splitEvents(inEvent);
      for (var i = 0, e; e = es[i]; i++) {
        dispatcher.up(e);
        dispatcher.leave(e);
      }
    }
  };

  // handler block for native mouse events
  var mouseEvents = {
    events: [
      "click",
      "mousedown",
      "mousemove",
      "mouseup",
      "mouseover",
      "mouseout",
      "mousescroll"
    ],
    click: function(inEvent) {
      dispatcher.tap(inEvent);
    },
    mousedown: function(inEvent) {
      dispatcher.down(inEvent);
    },
    mousemove: function(inEvent) {
      dispatcher.move(inEvent);
    },
    mouseup: function(inEvent) {
      dispatcher.up(inEvent);
    },
    mouseover: function(inEvent) {
      if (isDescendant(inEvent.target, inEvent.relatedTarget)) {
        var e = dispatcher.cloneEvent(inEvent);
        e.bubbles = false;
        dispatcher.enter(e);
      }
    },
    mouseout: function(inEvent) {
      if (isDescendant(inEvent.target, inEvent.relatedTarget)) {
        var e = dispatcher.cloneEvent(inEvent);
        e.bubbles = false;
        dispatcher.leave(e);
      }
    },
    mousescroll: function(inEvent) {
      dispatcher.scroll(inEvent);
    }
  };

  /*
   * touch events will simulate mouse events, but poorly
   * See README for more details
   */
  if ("ontouchstart" in window) {
    dispatcher.registerSource("touch", touchEvents, touchEvents.events);
  } else {
    dispatcher.registerSource("mouse", mouseEvents, mouseEvents.events);
  }
})(window.PointerEventShim);
