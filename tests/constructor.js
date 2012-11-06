/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('constructor', function() {
  test('new PointerEvent makes a PointerEvent', function() {
    var p = new PointerEvent('type');
    expect(p).to.be.a(PointerEvent);
  });
  test('PointerEvents have the required properties', function() {
    var props = [
      'bubbles',
      'cancelable',
      'view',
      'detail',
      'screenX',
      'screenY',
      'clientX',
      'clientY',
      'ctrlKey',
      'altKey',
      'shiftKey',
      'metaKey',
      'button',
      'which',
      'relatedTarget',
      'pointerId',
      'width',
      'height',
      'pressure',
      'tiltX',
      'tiltY',
      'pointerType',
      'hwTimestamp',
      'isPrimary'
    ];
    var p = new PointerEvent();
    props.forEach(function(k) {
      expect(p).to.have.property(k);
    });
  });
  test('PointerEvent can be initialized from an object', function() {
    var p = new PointerEvent('foo', {clientX: 40, clientY: 50});
    expect(p.clientX).to.be(40);
    expect(p.clientY).to.be(50);
  });
});
