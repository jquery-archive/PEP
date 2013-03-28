(function() {

  // TODO(dfreedman): remove when ShadowDOM polyfill is transparent
  var wrap = function(a){ return a };
  if (window.ShadowDOMPolyfill) {
    wrap = ShadowDOMPolyfill.wrap;
  }
  window.PointerEventsPolyfill = {
    wrap: wrap
  };

  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; }';
  }
  var attrib2css = [
    'none',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'scroll',
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';
  attrib2css.forEach(function(r) {
    if (String(r) === r) {
      styles += selector(r) + rule(r);
    } else {
      styles += r.selectors.map(selector) + rule(r.rule);
    }
  });
  var el = document.createElement('style');
  el.textContent = styles;
  // TODO(dfreedman): Workaround for
  // https://github.com/toolkitchen/ShadowDOM/issues/55
  wrap(document).head.appendChild(el);
})();
