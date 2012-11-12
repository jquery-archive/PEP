/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Event Generation', function() {
  var makeMouseEvent = function (inType, x, y) {
    var e = document.createEvent('MouseEvent');
    e.initMouseEvent(inType, true, true, null, null, x, y, x, y, false, false,
                     false, false, 0, null);
    return e;
  };

  shouldFire = true;

  teardown(function() {
    this.shouldFire = true;
  });

  // down -> mousedown && pointerdown
  var fire = function(type, x, y, target, callback) {
    var called = false;
    var fn = function(e) {
      callback(e);
      called = true;
    };
    var mouse = 'mouse' + type;
    var pointer = 'pointer' + type;
    var e = makeMouseEvent(mouse, x, y);
    target.addEventListener(pointer, fn);
    target.dispatchEvent(e);
    target.removeEventListener(pointer, fn);
    if (!__PointerEventShim__.dispatcher.handledEvents.get(e)) {
      throw new Error(mouse + ' was not handled');
    }
    if (!called && this.shouldFire) {
      throw new Error(pointer + ' callback was not called');
    }
    if (called && !this.shouldFire) {
      throw new Error(pointer + ' callback was called, and should not have been');
    }
  };


  test('MouseEvent makes a PointerEvent', function() {
    fire('down', 0, 0, document, function(e) {
      expect(e).to.have.property('type', 'pointerdown')
      expect(e).to.have.property('target', document);
    });
  });

  test('Mouse generated PointerEvents have pointerId 1', function() {
    fire('up', 0, 0, document, function(e) {
      expect(e).to.have.property('pointerId', 1);
    });
  });

  test('Multiple downs should be ignored', function() {
    fire('down', 0, 0, document, function(e) {
      // all good
    });
    shouldFire = false;
    fire('down', 0, 0, document, function(e) {
      expect().fail('should not be called');
    });
    shouldFire = true;
    fire('up', 0, 0, document, function(e) {
      // reset
    });
  });

  test('Event is targeted correctly', function() {
    var d = document.createElement('div');
    document.body.appendChild(d);
    var fn = function(e) {
      expect(e).to.have.property('target', d);
      expect(e).to.have.property('currentTarget', document);
    };
    fire('move', 0, 0, d, function(e) {
      expect(e).to.have.property('target', d);
    });
    document.body.removeChild(d);
  });
});
