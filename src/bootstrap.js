(function() {
  var thisFile = "bootstrap.js";
  var source = "", base = "";
  var s$ = document.querySelectorAll('script[src]');
  Array.prototype.forEach.call(s$, function(s) {
    var src = s.getAttribute('src');
    if (src.slice(-thisFile.length) == thisFile) {
      source = s;
      base = src.slice(0, -thisFile.length);
    }
  });
  var require = function(inSrc) {
    document.write('<script src="' + base + inSrc + '"></script>');
  };
  [
    "init.js",
    "dispatcher.js",
    "platform-events.js",
    "finalize.js"
  ].forEach(require);
})();
