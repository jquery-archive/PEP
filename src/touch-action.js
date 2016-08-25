import {touchActionSupported} from './feature-detect';

function shadowSelector(v) {
  return 'body /shadow-deep/ ' + selector(v);
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

// only add shadow selectors if shadowdom is supported
var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

export function applyAttributeStyles() {
  if (touchActionSupported) {
    attrib2css.forEach(function(r) {
      if (String(r) === r) {
        styles += selector(r) + rule(r) + '\n';
        if (hasShadowRoot) {
          styles += shadowSelector(r) + rule(r) + '\n';
        }
      } else {
        styles += r.selectors.map(selector) + rule(r.rule) + '\n';
        if (hasShadowRoot) {
          styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
        }
      }
    });

    var el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
  }
}
