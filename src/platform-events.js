/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1), mouse events, and MSPointerEvents.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var installer = scope.installer;

  // only activate if this platform does not have pointer events
  if (window.navigator.pointerEnabled === undefined) {

    if (window.navigator.msPointerEnabled) {
      var tp = window.navigator.msMaxTouchPoints;
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: tp,
        enumerable: true
      });
      dispatcher.registerSource('ms', scope.msEvents);
      dispatcher.registerTarget(document);
    } else {
      dispatcher.registerSource('mouse', scope.mouseEvents);
      if (window.ontouchstart !== undefined) {
        dispatcher.registerSource('touch', scope.touchEvents);
      }
      installer.enableOnSubtree(document);
    }

    Object.defineProperty(window.navigator, 'pointerEnabled', {value: true, enumerable: true});
  }
})(window.PointerEventsPolyfill);
