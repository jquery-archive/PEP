import PointerEvent from './PointerEvent';
import dispatcher from './dispatcher';
import mouseEvents from './mouse';
import touchEvents from './touch';
import msEvents from './ms';

export function applyPolyfill() {

  // only activate if this platform does not have pointer events
  if (!window.PointerEvent) {
    window.PointerEvent = PointerEvent;

    if (window.navigator.msPointerEnabled) {
      var tp = window.navigator.msMaxTouchPoints;
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: tp,
        enumerable: true
      });
      dispatcher.registerSource('ms', msEvents);
    } else {
      dispatcher.registerSource('mouse', mouseEvents);
      if (window.ontouchstart !== undefined) {
        dispatcher.registerSource('touch', touchEvents);
      }
    }

    dispatcher.register(document);
  }
}
