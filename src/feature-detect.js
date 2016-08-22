var touchActionValues = ['none', 'auto', 'pan-x', 'pan-y', 'manipulation'];

function hasTouchActionSupport() {
  var div = document.createElement('div');
  return touchActionValues.reduce(function(supported, value) {
    div.style.setProperty('touch-action', value);
    var isSet = div.style.getPropertyValue('touch-action') === value;
    return supported && isSet;
  }, true);
}

function hasPassiveEventListenerSupport() {
  var supported = false;
  try {
    addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: function() {
        supported = true;
      }
    }));
  } catch (e) {}
  return supported;
}

var passiveEventListenerSupported = hasPassiveEventListenerSupport();
var touchActionSupported = hasTouchActionSupport();

export {passiveEventListenerSupported, touchActionSupported};
