import dispatcher from './dispatcher';

var n = window.navigator;
var s, r, h;
function assertActive(id) {
  if (!dispatcher.pointermap.has(id)) {
    var error = new Error('InvalidPointerId');
    error.name = 'InvalidPointerId';
    throw error;
  }
}
function assertConnected(elem) {
  var parent = elem.parentNode;
  while (parent && parent !== elem.ownerDocument) {
    parent = parent.parentNode;
  }
  if (!parent) {
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
      dispatcher.setCapture(pointerId, this, true);
      this.msSetPointerCapture(pointerId);
    }
  };
  r = function(pointerId) {
    assertActive(pointerId);
    dispatcher.releaseCapture(pointerId, true);
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
    dispatcher.releaseCapture(pointerId);
  };
}
h = function hasPointerCapture(pointerId) {
  return !!dispatcher.captureInfo[pointerId];
};

export function applyPolyfill() {
  if (window.Element && !Element.prototype.setPointerCapture) {
    Object.defineProperties(Element.prototype, {
      'setPointerCapture': {
        value: s
      },
      'releasePointerCapture': {
        value: r
      },
      'hasPointerCapture': {
        value: h
      }
    });
  }
}
