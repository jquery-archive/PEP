/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Event Generation and Dispatching', function() {
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
    var t = target || host;
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
    if (!__PointerEventShim__.dispatcher.handledEvents.get(e) && !noFire) {
      throw new Error(mouse + ' was not handled');
    }
    if (!c.called && !noFire) {
      throw new Error(pointer + ' callback was not called');
    }
    if (c.called && noFire) {
      throw new Error(pointer + ' was generated, and should not have been');
    }
  };

  var correctTarget = function(expected, actual) {
    if (expected !== actual) {
      console.log(expected, actual);
      throw new Error('target is incorrect');
    }
  };

  test('MouseEvents are a source', function() {
    expect(__PointerEventShim__.dispatcher.eventSources).to.have.property('mouse');
  });

  test('TouchEvents are a source in touch environments', function() {
    if ('ontouchstart' in window) {
      expect(__PointerEventShim__.dispatcher.eventSources).to.have.property('touch');
    }
  });

  test('MSPointerEvents are a source in MSPointerEvent environments', function() {
    if (window.navigator.msPointerEnabled) {
      expect(__PointerEventShim__.dispatcher.eventSources).to.have.property('ms');
    }
  });

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

  test('Multiple downs from same pointerId should be ignored', function() {
    // called
    fire('down');
    // ignored
    fire('down', null, null, true);
    // reset
    fire('up');
  });

  test('Event targets correctly with touch-action: none', function() {
    var handler = function(e) {
      correctTarget(e.target, inner);
      correctTarget(e.currentTarget, host);
    };
    host.addEventListener('pointermove', handler);
    fire('move', null, inner);
    host.removeEventListener('pointermove', handler);
  });

  test('PointerEvents only fire on touch-action: none areas', function() {
    // move always fires
    fire('down', null, container, true);
    fire('up', null, container, true);
    fire('over', null, container, true);
    fire('out', null, container, true);
  });

  test('PointerEvents will fire anywhere after a down in a touch-action: none area', function() {
    fire('down');
    fire('over', null, container);
    fire('up');
    fire('over', null, container, true);
  });
});
