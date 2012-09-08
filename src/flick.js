/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/*
 * This module produces pointerflick events from pointerup and pointerdown
 * Events fired:
 *   - pointerflick: a pointer is placed down, moves rapidly, and is then
 *   removed.
 *      - Additional Properties:
 *        - xVelocity: signed velocity of the flick in the x direction
 *        - yVelocity: signed velocity of the flick in the y direction
 *        - velocity: unsigned total velocity of the flick
 *        - angle: angle of the flick in degress, where 0 is along the positive
 *          x axis
 *        - majorAxis: Axis with the greatest absolute velocity. Denoted with
 *          'x' or 'y'
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = scope.pointermap;
  var cloneEvent = dispatcher.cloneEvent;
  var flick = {
    /*
     * TODO(dfreedm): value should be low enough for low speed flicks, but high
     * enough to remove accidental flicks
     */
    MIN_VELOCITY: 0.5 /* px/ms */,
    pointerdown: function(inEvent) {
      var p = pointermap.getPointerById(inEvent.pointerId);
      p.flickStart = cloneEvent(inEvent);
    },
    pointerup: function(inEvent) {
      var p = pointermap.getPointerById(inEvent.pointerId);
      if (p.flickStart) {
        var f = this.makeFlick(p.flickStart, inEvent);
        p.flickStart = null;
      }
    },
    makeFlick: function(inStartEvent, inEvent) {
      var s = inStartEvent, e = inEvent;
      var dt = e.timeStamp - s.timeStamp;
      var dx = e.clientX - s.clientX, dy = e.clientY - s.clientY;
      var x = dx / dt, y = dy / dt, v = Math.sqrt(x*x + y*y);
      var ma = Math.abs(x) > Math.abs(y) ? 'x' : 'y';
      var a = this.calcAngle(x, y);
      if (Math.abs(v) >= this.MIN_VELOCITY) {
        var ev = dispatcher.makeEvent(s, 'pointerflick');
        ev.xVelocity = x;
        ev.yVelocity = y;
        ev.velocity = v;
        ev.angle = a;
        ev.majorAxis = ma;
        dispatcher.dispatchEvent(ev);
      }
    },
    calcAngle: function(inX, inY) {
      return (Math.atan2(inY, inX) * 180 / Math.PI);
    }
  };
  dispatcher.registerHook('flick', flick, ['pointerdown', 'pointerup']);
})(window.PointerEventShim);
