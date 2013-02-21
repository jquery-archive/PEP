/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

var em = {
  makeMouseEvent: function (inType) {
    var e = document.createEvent('MouseEvent');
    e.initMouseEvent(
      inType, true, true, null, null, 0, 0, 0, 0, false, false,
      false, false, 0, null
    );
    return e;
  },
  watch: function(fn) {
    var self = this;
    fn.called = false;
    return function() {
      try {
        fn.called = true;
        return fn.apply(self, arguments);
      } catch(e) {
        fn.error = e;
      }
    }
  },
  fire: function(type, callback, target, noFire) {
    var t = target || host;
    var c = callback || function(){};
    var fn = this.watch(c);
    var mouse = 'mouse' + type;
    var pointer = 'pointer' + type;
    var e = this.makeMouseEvent(mouse);
    t.addEventListener(pointer, fn);
    t.dispatchEvent(e);
    t.removeEventListener(pointer, fn);
    if (c.error) {
      throw c.error;
    }
    if (!PointerEventsPolyfill.dispatcher.handledEvents.get(e) && !noFire) {
      throw new Error(mouse + ' was not handled');
    }
    if (!c.called && !noFire) {
      throw new Error(pointer + ' callback was not called');
    }
    if (c.called && noFire) {
      throw new Error(pointer + ' was generated, and should not have been');
    }
  },

  correctTarget: function(expected, actual) {
    if (expected !== actual) {
      console.log(expected, actual);
      throw new Error('target is incorrect');
    }
  }
};
