(function(scope) {
    // FIXME make this split touch events into individual fingers
    if ("ontouchstart" in window) {
        var dispatcher = scope.dispatcher;
        dispatcher.events = {
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
    }
})(window.PointerEventShim);
