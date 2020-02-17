function shadowSelector(s) {
  return 'body /shadow-deep/ ' + s;
}
function rule(v) {
  return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; }';
}
var attrib2css = [
  { selector: '[touch-action="none"]', value: 'none' },
  { selector: '[touch-action="auto"]', value: 'auto' },
  { selector: '[touch-action~="pan-x"]', value: 'pan-x' },
  { selector: '[touch-action~="pan-y"]', value: 'pan-y' },
  { selector: '[touch-action~="pan-up"]', value: 'pan-up' },
  { selector: '[touch-action~="pan-down"]', value: 'pan-down' },
  { selector: '[touch-action~="pan-left"]', value: 'pan-left' },
  { selector: '[touch-action~="pan-right"]', value: 'pan-right' }
];
var styles = '';

// only install stylesheet if the browser has touch action support
var hasNativePE = window.PointerEvent || window.MSPointerEvent;

// only add shadow selectors if shadowdom is supported
var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

export function applyAttributeStyles() {
  if (hasNativePE) {
    attrib2css.forEach(function(r) {
      styles += r.selector + rule(r.value) + '\n';
      if (hasShadowRoot) {
        styles += shadowSelector(r.selector) + rule(r.value) + '\n';
      }
    });

    var el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
  }
}
