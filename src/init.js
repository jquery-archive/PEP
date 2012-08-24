(function() {
  window.PointerEventShim = {
    clone: function(inSink, inSource) {
      var p$ = [].slice.call(arguments, 1);
      for (var i=0, p; p=p$[i]; i++) {
        if (p) {
          var g, s;
          for (var n in p) {
            //inSink[n] = p[n];
            /* fixme: sigh, copy getters/setters  */
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
    },
  };
})();
