import dispatcher from 'dispatcher';

var n = window.navigator;
var s, r;
function assertDown(id) {
  if (!dispatcher.pointermap.has(id)) {
    throw new Error('InvalidPointerId');
  }
}
if (n.msPointerEnabled) {
  s = function(pointerId) {
    assertDown(pointerId);
    this.msSetPointerCapture(pointerId);
  };
  r = function(pointerId) {
    assertDown(pointerId);
    this.msReleasePointerCapture(pointerId);
  };
} else {
  s = function setPointerCapture(pointerId) {
    assertDown(pointerId);
    dispatcher.setCapture(pointerId, this);
  };
  r = function releasePointerCapture(pointerId) {
    assertDown(pointerId);
    dispatcher.releaseCapture(pointerId, this);
  };
}

export function applyPolyfill() {
  if (window.Element && !Element.prototype.setPointerCapture) {
    Object.defineProperties(Element.prototype, {
      'setPointerCapture': {
        value: s
      },
      'releasePointerCapture': {
        value: r
      }
    });
  }
}
