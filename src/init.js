/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  // Function bind is required, iOS is missing it :(
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
      var _this = this;
      return function() {
        return _this.apply(scope, arguments);
      }
    }
  }
  scope = scope || {};
  scope.clone = function(inSink, inSource) {
    var p$ = [].slice.call(arguments, 1);
    for (var i=0, p; p=p$[i]; i++) {
      if (p) {
        var g, s;
        for (var n in p) {
          // copy getters/setters
          g = p.__lookupGetter__(n), s = p.__lookupSetter__(n);
          if (g) {
            inSink.__defineGetter__(n, g);
          } else {
            inSink[n] = p[n];
          }
          if (s) {
            inSink.__defineSetter__(n, s);
          }
        }
      }
    }
    return inSink;
  };
})(window.PointerEventShim);
