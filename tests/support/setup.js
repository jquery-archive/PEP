define([
  'intern/chai!',
  'intern/chai!assert',
  'chai-spies',
  'exports'
], function(chai, assert, spies, exports) {
  chai.config.includeStack = true;
  chai.use(spies);

  exports.HAS_TOUCH = 'ontouchstart' in window;
  var HAS_MS = exports.HAS_MS = Boolean(navigator.msPointerEnabled);

  exports.correctTarget = function(expected, actual) {
    assert.strictEqual(actual, expected, 'target is incorrect');
  };

  exports.fire = function(shortType, target, callback) {
    if (target) {
      if (callback) {
        prep('pointer' + shortType, target, callback);
      }
      var e, type;
      var buttons = shortType === 'down' ? 1 : 0;
      if (HAS_MS) {
        var cap = shortType.slice(0, 1).toUpperCase() + shortType.slice(1);
        type = 'MSPointer' + cap;
        e = document.createEvent('MSPointerEvent');
        e.initPointerEvent(
          type, true, true, null, null, 0, 0, 0, 0, false, false, false, false, 0,
          null, 0, 0, 0, 0, 0, 0, 0, 0, 1, e.MSPOINTER_TYPE_MOUSE, 0, true
        );
      } else {
        type = 'mouse' + shortType;
        e = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          buttons: buttons
        });
      }
      target.dispatchEvent(e);
    }
  };

  exports.eventSetup = function eventSetup(shortType, target, callback) {
    if (Array.isArray(shortType)) {
      for (var i = 0; i < shortType.length; i++) {
        eventSetup(shortType[i], target, callback);
      }
      return;
    }
    var type = 'pointer' + shortType;
    target.addEventListener(type, callback);
  };

  exports.eventRemove = function eventRemove(shortType, target, callback) {
    if (Array.isArray(shortType)) {
      for (var i = 0; i < shortType.length; i++) {
        eventRemove(shortType[i], target, callback);
      }
      return;
    }
    var type = 'pointer' + shortType;
    target.removeEventListener(type, callback);
  };

  var prep = exports.prep = function(event, target, callback) {
    var fn = function() {
      callback();
      target.removeEventListener(event, fn);
    };
    target.addEventListener(event, fn);
  };
});
