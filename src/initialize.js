/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  // Function bind is required, iOS is missing it :(
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope, /*arguments*/) {
      var toArray = function(inArgs, inStart) {
        return Array.prototype.slice.call(inArgs, inStart || 0);
      };
      var _this = this;
      var args = toArray(arguments, 1);
      return function() {
        var newArgs = toArray(arguments, 0);
        return _this.apply(scope, args.concat(newArgs));
      }
    };
  }
  scope = scope || {};
  scope.clone = function(inSink, inSource) {
    var p$ = [].slice.call(arguments, 1);
    for (var i=0, p; p=p$[i]; i++) {
      if (p) {
        for (var n in p) {
            inSink[n] = p[n];
        }
      }
    }
    return inSink;
  };
  window.__PointerEventShim__ = scope;
})(window.__PointerEventShim__);
