/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var cloneEvent = dispatcher.cloneEvent;
  var flick = {
    // TODO(dfreedm): find a good value for this
    MIN_VELOCITY: 0.5 /* px/ms */,
    pointerdown: function(inEvent) {
      this.startEvent = cloneEvent(inEvent);
    },
    pointerup: function(inEvent) {
      if (this.startEvent) {
        var f = this.makeFlick(inEvent);
        this.startEvent = null;
      }
    },
    makeFlick: function(inEvent) {
      var s = this.startEvent, e = inEvent;
      var dt = e.timeStamp - s.timeStamp;
      var dx = e.clientX - s.clientX, dy = e.clientY - s.clientY;
      var x = dx / dt, y = dy / dt, v = Math.sqrt(x*x + y*y);
      var ma = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      var a = this.calcAngle(x, y);
      if (Math.abs(v) > this.MIN_VELOCITY) {
        var ev = dispatcher.makeEvent(this.startEvent, 'pointerflick');
        ev.xVelocity = x;
        ev.yVelocity = y;
        ev.velocity = v;
        ev.angle = a;
        ev.majorAxis = ma;
        console.log({x: x, y: y, v: v, ma: ma, a: a});
        dispatcher.dispatchEvent(ev);
      }
    },
    calcAngle: function(inX, inY) {
      return (Math.atan2(inY, inX) * 180 / Math.PI);
    }
  };
  dispatcher.registerHook('flick', flick, ['pointerdown', 'pointerup']);
})(window.PointerEventShim);
