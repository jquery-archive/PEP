import dispatcher from './dispatcher';
import PointerMap from './pointermap';
import Installer from './installer';
import targeting from './targeting';
import PointerEvent from './PointerEvent';
import { applyAttributeStyles } from './touch-action';
import { applyPolyfill as applyPointerEventPolyfill } from './platform-events';
import { applyPolyfill as applyCapturePolyfill } from './capture';

applyAttributeStyles();
applyPointerEventPolyfill();
applyCapturePolyfill();

export default {
  dispatcher: dispatcher,
  Installer: Installer,
  PointerEvent: PointerEvent,
  PointerMap: PointerMap,
  targetFinding: targeting
};
