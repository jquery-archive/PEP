/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Event Generation', function() {
  var makeMouseEvent = function (inType) {
    var e = document.createEvent('MouseEvent');
    e.initMouseEvent(inType, true, true, null, null, 0, 0, 0, 0, false, false,
                     false, false, 0, null);
    return e;
  };

  var watch = function(fn) {
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
  };

  // down -> mousedown && pointerdown
  var fire = function(type, callback, target, noFire) {
    var t = target || document;
    var c = callback || function(){};
    var fn = watch(c);
    var mouse = 'mouse' + type;
    var pointer = 'pointer' + type;
    var e = makeMouseEvent(mouse);
    t.addEventListener(pointer, fn);
    t.dispatchEvent(e);
    t.removeEventListener(pointer, fn);
    if (c.error) {
      throw c.error;
    }
    if (!__PointerEventShim__.dispatcher.handledEvents.get(e)) {
      throw new Error(mouse + ' was not handled');
    }
    if (!c.called && !noFire) {
      throw new Error(pointer + ' callback was not called');
    }
  };

  var correctTarget = function(expected, actual) {
    if (expected !== actual) {
      throw new Error('target is incorrect');
    }
  };

  test('MouseEvent makes a PointerEvent', function() {
    fire('move', function(e){
      expect(e.type).to.be('pointermove');
    });
  });

  test('Mouse generated PointerEvents have pointerId 1', function() {
    fire('move', function(e) {
      expect(e.pointerId).to.be(1);
    });
  });

  test('Multiple downs should be ignored', function() {
    // called
    fire('down');
    // ignored
    fire('down', null, null, true);
    // reset
    fire('up');
  });

  test('Event bubbles correctly', function() {
    var d = document.createElement('div');
    document.body.appendChild(d);
    var handler = function(e) {
      correctTarget(e.target, d);
      correctTarget(e.currentTarget, document);
    };
    var fn = watch(handler);
    document.addEventListener('pointermove', fn);
    fire('move', function(e) {
      correctTarget(e.target, d);
    }, d);
    document.removeEventListener('pointermove', fn);
    document.body.removeChild(d);
    if (!handler.called) {
      throw new Error('pointerdown event did not bubble to document');
    }
  });
});
