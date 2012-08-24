(function(scope) {
    var dispatcher = scope.dispatcher;
    dispatcher.events = {
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
    }
})(window.PointerEventShim);
