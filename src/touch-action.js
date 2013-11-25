/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {
  function shadowSelector(v) {
    return 'body ^^ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; touch-action-delay: none; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';
  attrib2css.forEach(function(r) {
    if (String(r) === r) {
      styles += selector(r) + rule(r) + '\n';
      styles += shadowSelector(r) + rule(r) + '\n';
    } else {
      styles += r.selectors.map(selector) + rule(r.rule) + '\n';
      styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
    }
  });
  var el = document.createElement('style');
  el.textContent = styles;
  document.head.appendChild(el);
})();
