/**
 * This is the constructor for new PointerEvents.
 *
 * New Pointer Events must be given a type, and an optional dictionary of
 * initialization properties.
 *
 * Due to certain platform requirements, events returned from the constructor
 * identify as MouseEvents.
 *
 * @constructor
 * @param {String} inType The type of the event to create.
 * @param {Object} [inDict] An optional dictionary of initial event properties.
 * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
 */
var MOUSE_PROPS = [
  'bubbles',
  'cancelable',
  'view',
  'screenX',
  'screenY',
  'clientX',
  'clientY',
  'ctrlKey',
  'altKey',
  'shiftKey',
  'metaKey',
  'button',
  'relatedTarget',
  'pageX',
  'pageY'
];

var MOUSE_DEFAULTS = [
  false,
  false,
  null,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  0,
  null,
  0,
  0
];

function PointerEvent(inType, inDict) {
  inDict = inDict || Object.create(null);

  var e = document.createEvent('Event');
  e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

  // define inherited MouseEvent properties
  // skip bubbles and cancelable since they're set above in initEvent()
  for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
    p = MOUSE_PROPS[i];
    e[p] = inDict[p] || MOUSE_DEFAULTS[i];
  }
  e.buttons = inDict.buttons || 0;

  // Spec requires that pointers without pressure specified use 0.5 for down
  // state and 0 for up state.
  var pressure = 0;

  if (inDict.pressure !== undefined && e.buttons) {
    pressure = inDict.pressure;
  } else {
    pressure = e.buttons ? 0.5 : 0;
  }

  // add x/y properties aliased to clientX/Y
  e.x = e.clientX;
  e.y = e.clientY;

  // define the properties of the PointerEvent interface
  e.pointerId = inDict.pointerId || 0;
  e.width = inDict.width || 1;
  e.height = inDict.height || 1;
  e.pressure = pressure;
  e.tiltX = inDict.tiltX || 0;
  e.tiltY = inDict.tiltY || 0;
  e.twist = inDict.twist || 0;
  e.tangentialPressure = inDict.tangentialPressure || 0;
  e.pointerType = inDict.pointerType || '';
  e.hwTimestamp = inDict.hwTimestamp || 0;
  e.isPrimary = inDict.isPrimary || false;
  e.detail = 0;
  return e;
}

export default PointerEvent;
