define([
  '../support/tdd',
  'intern/chai!expect',
  '../support/setup',
  'pep'
], function(tdd, expect, util, pep) {
  var HAS_MS = util.HAS_MS;
  var fire = util.fire;
  var prep = util.prep;
  var setup = tdd.beforeEach;
  var suite = tdd.suite;
  var teardown = tdd.afterEach;
  var test = tdd.test;

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
      expect(function() { set(host); }).to.throw(/InvalidPointerId/);
    });

    test('releasePointerCapture throws exception when the pointerId is not on screen', function() {
      expect(function() { release(host); }).to.throw(/InvalidPointerId/);
    });

    suite('pointercapture events', function() {
      test('Element.setPointerCapture fires a gotpointercapture event', function() {
        if (HAS_MS) {
          this.skip('this test disabled for MSPointerEvents due to flakiness');
        }

        var dfd = this.async();
        prep('gotpointercapture', host, dfd.resolve.bind(dfd));
        fire('down', host);
        set(host);
        fire('up', host);
      });

      test('Element.releasePointerCapture fires a lostpointercapture event', function() {
        if (HAS_MS) {
          this.skip('this test disabled for MSPointerEvents due to flakiness');
        }

        var dfd = this.async();
        prep('lostpointercapture', host, dfd.resolve.bind(dfd));
        fire('down', host);
        set(host);
        release(host);
        fire('up', host);
      });

      test('pointerup fires lostpointercapture for the capturing element', function() {
        if (HAS_MS) {
          this.skip('this test disabled for MSPointerEvents due to flakiness');
        }

        var dfd = this.async(30000, 2);
        prep('lostpointercapture', host, dfd.resolve.bind(dfd));
        host.addEventListener('lostpointercapture', dfd.resolve.bind(dfd));
        fire('down', host);
        set(host);
        fire('up', host);
      });

      test('setPointerCapture will release an already captured pointer, firing events', function() {
        if (HAS_MS) {
          this.skip('this test disabled for MSPointerEvents due to flakiness');
        }

        var issued = 0;
        var wait = function() {
          issued++;
          return function(e) {
            issued--;
            if (e) {
              throw e;
            }
            if (issued === 0) {
              dfd.resolve();
            }
          };
        };

        var dfd = this.async();
        prep('gotpointercapture', inner, wait());
        prep('lostpointercapture', host, wait());
        fire('down', host);
        set(host);
        set(inner);
        fire('up', host);
      });

      test('capture multiple pointers', function() {
        this.skip('This test breaks "PointerEvents from mouse fire anywhere by default"');

        if (HAS_MS) {
          this.skip('this test disabled for MSPointerEvents due to flakiness');
        }

        var dfd = this.async();
        var pm = pep.dispatcher.pointermap;
        var ids = 0;
        function wait(e) {
          ids += e.pointerId;
          if (ids === 3) {
            pm.clear();
            dfd.resolve();
          }
        }
        host.addEventListener('gotpointercapture', wait);
        var e = new pep.PointerEvent('pointerdown', { pointerId: 1 });
        pm.set(1, e);
        host.dispatchEvent(e);
        set(host, 1);
        e = new pep.PointerEvent('pointerdown', { pointerId: 2 });
        pm.set(2, e);
        host.dispatchEvent(e);
        set(host, 2);
      });
    });
  });
});
