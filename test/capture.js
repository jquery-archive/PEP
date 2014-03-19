/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Pointer Capture', function() {
  var set = function(el, id) {
    el.setPointerCapture(id || 1);
  };
  var release = function(el, id) {
    el.releasePointerCapture(id || 1);
  };

  var container, host, inner;
  setup(function() {
    container = document.createElement('div');
    container.innerHTML = '<div id="host" touch-action="none"><div id="inner"></div></div>';
    host = container.firstElementChild;
    inner = host.firstElementChild;
    document.body.appendChild(container);
  });

  teardown(function() {
    document.body.removeChild(container);
  });

  test('Element has setPointerCapture and releasePointerCapture', function() {
    expect(host).to.have.property('setPointerCapture');
    expect(host).to.have.property('releasePointerCapture');
  });

  test('setPointerCapture throw exceptions when the pointerId is not on screen', function() {
    expect(function(){ set(host); }).to.throw(/InvalidPointerId/);
  });

  test('releasePointerCapture throws exception when the pointerId is not on screen', function() {
    expect(function(){ release(host); }).to.throw(/InvalidPointerId/);
  });

  suite('pointercapture events', function() {
    test('Element.setPointerCapture fires a gotpointercapture event', function(done) {
      // this test disabled for MSPointerEvents due to flakiness
      if (navigator.msPointerEnabled) {
        done();
      } else {
        prep('gotpointercapture', host, done);
        fire('down', host);
        set(host);
        fire('up', host);
      }
    });

    test('Element.releasePointerCapture fires a lostpointercapture event', function(done) {
      // this test disabled for MSPointerEvents due to flakiness
      if (navigator.msPointerEnabled) {
        done();
      } else {
        prep('lostpointercapture', host, done);
        fire('down', host);
        set(host);
        release(host);
        fire('up', host);
      }
    });

    test('pointerup fires a lostpointercapture event for the element capturing that pointerId', function(done) {
      // this test disabled for MSPointerEvents due to flakiness
      if (navigator.msPointerEnabled) {
        done();
      } else {
        prep('lostpointercapture', host, done);
        host.addEventListener('lostpointercapture', done);
        fire('down', host);
        set(host);
        fire('up', host);
      }
    });

    test('setPointerCapture will release an already captured pointer, firing events', function(done) {
      var issued = 0;
      var wait = function() {
        issued++;
        return function(e) {
          issued--;
          if (e) {
            throw e;
          }
          if (issued === 0) {
            done();
          }
        };
      };
      // this test disabled for MSPointerEvents due to flakiness
      if (navigator.msPointerEnabled) {
        done();
      } else {
        prep('gotpointercapture', inner, wait());
        prep('lostpointercapture', host, wait());
        fire('down', host);
        set(host);
        set(inner);
        fire('up', host);
      }
    });

    test('capture multiple pointers', function(done) {
      if (!HAS_MS) {
        var pm = PointerEventsPolyfill.dispatcher.pointermap;
        var ids = 0;
        function wait(e) {
          ids += e.pointerId;
          if (ids == 3) {
            pm.clear();
            done();
          }
        }
        host.addEventListener('gotpointercapture', wait);
        var e = new PointerEvent('pointerdown', {pointerId: 1});
        pm.set(1, e);
        host.dispatchEvent(e);
        set(host, 1);
        e = new PointerEvent('pointerdown', {pointerId: 2});
        pm.set(2, e);
        host.dispatchEvent(e);
        set(host, 2);
      } else {
        done();
      }
    });
  });
});
