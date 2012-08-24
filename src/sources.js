(function(scope) {
  var dispatcher = scope.dispatcher;
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
        this.overEvent = dispatcher.cloneEvent(e);
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
          dispatcher.leave(this.overEvent);
          dispatcher.enter(e);
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
      dispatcher.enter(inEvent);
    },
    mouseout: function(inEvent) {
      dispatcher.leave(inEvent);
    },
    mousescroll: function(inEvent) {
      dispatcher.scroll(inEvent);
    }
  };

  if ("ontouchstart" in window) {
    dispatcher.registerSource("touch", touchEvents, touchEvents.events);
  } else {
    dispatcher.registerSource("mouse", mouseEvents, mouseEvents.events);
  }
})(window.PointerEventShim);
