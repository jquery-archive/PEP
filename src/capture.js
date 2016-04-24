import dispatcher from './dispatcher';

var n = window.navigator;
var s, r;
function assertActive(id) {
  if (!dispatcher.pointermap.has(id)) {
    var error = new Error('InvalidPointerId');
    error.name = 'InvalidPointerId';
    throw error;
  }
}
function assertConnected(elem) {
  if (!elem.ownerDocument.contains(elem)) {
    var error = new Error('InvalidStateError');
    error.name = 'InvalidStateError';
    throw error;
  }
}
function inActiveButtonState(id) {
  var p = dispatcher.pointermap.get(id);
  return p.buttons !== 0;
}
if (n.msPointerEnabled) {
  s = function(pointerId) {
    assertActive(pointerId);
    assertConnected(this);
    if (inActiveButtonState(pointerId)) {
      this.msSetPointerCapture(pointerId);
    }
  };
  r = function(pointerId) {
    assertActive(pointerId);
    this.msReleasePointerCapture(pointerId);
  };
} else {
  s = function setPointerCapture(pointerId) {
    assertActive(pointerId);
    assertConnected(this);
    if (inActiveButtonState(pointerId)) {
      dispatcher.setCapture(pointerId, this);
    }
  };
  r = function releasePointerCapture(pointerId) {
    assertActive(pointerId);
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
