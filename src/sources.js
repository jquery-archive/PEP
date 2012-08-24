(function(scope) {
  // TODO(dfreedm) make this split touch events into individual fingers
  var touchEvents = {
    click: function(inEvent) {
      dispatcher.tap(inEvent);
    },
    touchstart: function(inEvent) {
      dispatcher.down(inEvent);
      this.overEvent = dispatcher.cloneEvent(inEvent);
      dispatcher.enter(inEvent);
    },
    touchmove: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      dispatcher.move(inEvent);
      if (this.overEvent && this.overEvent.target !== e.target) {
        this.overEvent.relatedTarget = e.target;
        e.relatedTarget = this.overEvent.target;
        dispatcher.leave(this.overEvent);
        dispatcher.enter(e);
      }
      this.overEvent = e;
    },
    touchend: function(inEvent) {
      dispatcher.up(inEvent);
      dispatcher.leave(inEvent);
    }
  };
  var mouseEvents = {
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
  var dispatcher = scope.dispatcher;
  if ("ontouchstart" in window) {
    dispatcher.events = touchEvents;
  } else {
    dispatcher.events = mouseEvents;
  }
})(window.PointerEventShim);
