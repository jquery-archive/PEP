import targeting from './targeting';
import dispatcher from './dispatcher';
import Installer from './installer';
import mouseEvents from './mouse';

var captureInfo = dispatcher.captureInfo;
var findTarget = targeting.findTarget.bind(targeting);
var allShadows = targeting.allShadows.bind(targeting);
var pointermap = dispatcher.pointermap;

// this should be long enough to ignore compat mouse events made by touch
var DEDUP_TIMEOUT = 2500;
var ATTRIB = 'touch-action';
var INSTALLER;

// bitmask for _scrollType
var UP = 1;
var DOWN = 2;
var LEFT = 4;
var RIGHT = 8;
var AUTO = UP | DOWN | LEFT | RIGHT;

// handler block for native touch events
var touchEvents = {
  events: [
    'touchstart',
    'touchmove',
    'touchforcechange',
    'touchend',
    'touchcancel'
  ],
  register: function(target) {
    INSTALLER.enableOnSubtree(target);
  },
  unregister: function() {

    // TODO(dfreedman): is it worth it to disconnect the MO?
  },
  elementAdded: function(el) {
    var a = el.getAttribute(ATTRIB);
    var st = this.touchActionToScrollType(a);
    if (typeof st === "number") {
      el._scrollType = st;
      dispatcher.listen(el, this.events);

      // set touch-action on shadows as well
      allShadows(el).forEach(function(s) {
        s._scrollType = st;
        dispatcher.listen(s, this.events);
      }, this);
    }
  },
  elementRemoved: function(el) {

    // In some cases, an element is removed before a touchend.
    // When this is the case, we should wait for the touchend before unlistening,
    // because we still want pointer events to bubble up after removing from DOM.
    if (pointermap.size > 0) {
      var evts = this.events;
      el.addEventListener('touchend', function() {
        el._scrollType = undefined;
        dispatcher.unlisten(el, evts);
      });
    } else {
      el._scrollType = undefined;
      dispatcher.unlisten(el, this.events);
    }

    // remove touch-action from shadow
    allShadows(el).forEach(function(s) {
      s._scrollType = undefined;
      dispatcher.unlisten(s, this.events);
    }, this);
  },
  elementChanged: function(el, oldValue) {
    var a = el.getAttribute(ATTRIB);
    var st = this.touchActionToScrollType(a);
    var oldSt = this.touchActionToScrollType(oldValue);

    // simply update scrollType if listeners are already established
    if (typeof st === "number" && typeof oldSt === "number") {
      el._scrollType = st;
      allShadows(el).forEach(function(s) {
        s._scrollType = st;
      }, this);
    } else if (typeof oldSt === "number") {
      this.elementRemoved(el);
    } else if (typeof st === "number") {
      this.elementAdded(el);
    }
  },
  scrollTypes: {
    UP: function(s) {
      return s.includes('pan-y') || s.includes('pan-up') ? UP : 0;
    },
    DOWN: function(s) {
      return s.includes('pan-y') || s.includes('pan-down') ? DOWN : 0;
    },
    LEFT: function(s) {
      return s.includes('pan-x') || s.includes('pan-left') ? LEFT : 0;
    },
    RIGHT: function(s) {
      return s.includes('pan-x') || s.includes('pan-right') ? RIGHT : 0;
    }
  },
  touchActionToScrollType: function(touchAction) {
    if (!touchAction) {
      return;
    }

    if (touchAction === "auto") {
      return AUTO;
    }

    if (touchAction === "none") {
      return 0;
    }

    var s = touchAction.split(' ');
    var st = this.scrollTypes;

    // construct a bitmask of allowed scroll directions
    return st.UP(s) | st.DOWN(s) | st.LEFT(s) | st.RIGHT(s);
  },
  POINTER_TYPE: 'touch',
  firstTouch: null,
  isPrimaryTouch: function(inTouch) {
    return this.firstTouch === inTouch.identifier;
  },
  setPrimaryTouch: function(inTouch) {

    // set primary touch if there no pointers, or the only pointer is the mouse
    if (pointermap.size === 0 || (pointermap.size === 1 && pointermap.has(1))) {
      this.firstTouch = inTouch.identifier;
      this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
      this.scrolling = false;
    }
  },
  removePrimaryPointer: function(inPointer) {
    if (inPointer.isPrimary) {
      this.firstTouch = null;
      this.firstXY = null;
    }
  },
  typeToButtons: function(type) {
    var ret = 0;
    if (type === 'touchstart' || type === 'touchmove' || type === 'touchforcechange') {
      ret = 1;
    }
    return ret;
  },
  touchToPointer: function(inTouch) {
    var cte = this.currentTouchEvent;
    var e = dispatcher.cloneEvent(inTouch);

    // We reserve pointerId 1 for Mouse.
    // Touch identifiers can start at 0.
    // Add 2 to the touch identifier for compatibility.
    var id = e.pointerId = inTouch.identifier + 2;
    e.target = captureInfo[id] || findTarget(e);
    e.bubbles = true;
    e.cancelable = true;
    e.button = 0;
    e.buttons = this.typeToButtons(cte.type);
    e.width = (inTouch.radiusX || inTouch.webkitRadiusX || 0) * 2;
    e.height = (inTouch.radiusY || inTouch.webkitRadiusY || 0) * 2;
    e.pressure = inTouch.force !== undefined ?
      inTouch.force :
      inTouch.webkitForce !== undefined ?
        inTouch.webkitForce : undefined;
    e.isPrimary = this.isPrimaryTouch(inTouch);
    if (inTouch.altitudeAngle) {
      var tan = Math.tan(inTouch.altitudeAngle);
      var radToDeg = 180 / Math.PI;
      e.tiltX = Math.atan(Math.cos(inTouch.azimuthAngle) / tan) * radToDeg;
      e.tiltY = Math.atan(Math.sin(inTouch.azimuthAngle) / tan) * radToDeg;
    } else {
      e.tiltX = 0;
      e.tiltY = 0;
    }
    if (inTouch.touchType === 'stylus') {
      e.pointerType = 'pen';
    } else {
      e.pointerType = this.POINTER_TYPE;
    }

    // forward modifier keys
    e.altKey = cte.altKey;
    e.ctrlKey = cte.ctrlKey;
    e.metaKey = cte.metaKey;
    e.shiftKey = cte.shiftKey;

    // forward touch preventDefaults
    var self = this;
    e.preventDefault = function() {
      self.scrolling = false;
      self.firstXY = null;
      cte.preventDefault();
    };
    return e;
  },
  processTouches: function(inEvent, inFunction) {
    var tl = inEvent.changedTouches;
    this.currentTouchEvent = inEvent;
    for (var i = 0, t; i < tl.length; i++) {
      t = tl[i];
      inFunction.call(this, this.touchToPointer(t));
    }
  },

  // For single axis scrollers, determines whether the element should emit
  // pointer events or behave as a scroller
  shouldScroll: function(inEvent) {
    if (this.firstXY) {
      var ret;
      var st = inEvent.currentTarget._scrollType;
      if (st === 0) {

        // this element is a `touch-action: none`, should never scroll
        ret = false;
      } else if (st === AUTO) {

        // this element is a `touch-action: auto`, should always scroll
        ret = true;
      } else {
        var t = inEvent.changedTouches[0];

        var dy = t.clientY - this.firstXY.Y;
        var dya = Math.abs(dy);
        var dx = t.clientX - this.firstXY.X;
        var dxa = Math.abs(dx);

        var up = st & UP;
        var down = st & DOWN;
        var left = st & LEFT;
        var right = st & RIGHT;

        if (left && right) {

          // should scroll on the x axis
          ret = dxa > dya;
        } else if (left) {

          // should scroll left
          ret = dxa > dya && dx > 0;
        } else if (right) {

          // should scroll right
          ret = dxa > dya && dx < 0;
        }

        if (!ret) {
          if (up && down) {

            // should scroll on the y axis
            ret = dxa < dya;
          } else if (up) {

            // should scroll up
            ret = dxa < dya && dy > 0;
          } else if (down) {

            // should scroll down
            ret = dxa < dya && dy < 0;
          }
        }

      }
      this.firstXY = null;
      return ret;
    }
  },
  findTouch: function(inTL, inId) {
    for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
      if (t.identifier === inId) {
        return true;
      }
    }
  },

  // In some instances, a touchstart can happen without a touchend. This
  // leaves the pointermap in a broken state.
  // Therefore, on every touchstart, we remove the touches that did not fire a
  // touchend event.
  // To keep state globally consistent, we fire a
  // pointercancel for this "abandoned" touch
  vacuumTouches: function(inEvent) {
    var tl = inEvent.touches;

    // pointermap.size should be < tl.length here, as the touchstart has not
    // been processed yet.
    if (pointermap.size >= tl.length) {
      var d = [];
      pointermap.forEach(function(value, key) {

        // Never remove pointerId == 1, which is mouse.
        // Touch identifiers are 2 smaller than their pointerId, which is the
        // index in pointermap.
        if (key !== 1 && !this.findTouch(tl, key - 2)) {
          var p = value.out;
          d.push(p);
        }
      }, this);
      d.forEach(this.cancelOut, this);
    }
  },
  touchstart: function(inEvent) {
    this.vacuumTouches(inEvent);
    this.setPrimaryTouch(inEvent.changedTouches[0]);
    this.dedupSynthMouse(inEvent);
    if (!this.scrolling) {
      this.processTouches(inEvent, this.overDown);
    }
  },
  overDown: function(inPointer) {
    pointermap.set(inPointer.pointerId, {
      target: inPointer.target,
      out: inPointer,
      outTarget: inPointer.target
    });
    dispatcher.enterOver(inPointer);
    dispatcher.down(inPointer);
  },

  // Called when pressure or tilt changes without the x/y changing
  touchforcechange: function(inEvent) {
    this.touchmove(inEvent);
  },
  touchmove: function(inEvent) {
    if (!this.scrolling) {
      if (this.shouldScroll(inEvent)) {
        this.scrolling = true;
        this.touchcancel(inEvent);
      } else {
        if (inEvent.type !== 'touchforcechange') {
          inEvent.preventDefault();
        }
        this.processTouches(inEvent, this.moveOverOut);
      }
    }
  },
  moveOverOut: function(inPointer) {
    var event = inPointer;
    var pointer = pointermap.get(event.pointerId);

    // a finger drifted off the screen, ignore it
    if (!pointer) {
      return;
    }
    var outEvent = pointer.out;
    var outTarget = pointer.outTarget;
    dispatcher.move(event);
    if (outEvent && outTarget !== event.target) {
      outEvent.relatedTarget = event.target;
      event.relatedTarget = outTarget;

      // recover from retargeting by shadow
      outEvent.target = outTarget;
      if (event.target) {
        dispatcher.leaveOut(outEvent);
        dispatcher.enterOver(event);
      } else {

        // clean up case when finger leaves the screen
        event.target = outTarget;
        event.relatedTarget = null;
        this.cancelOut(event);
      }
    }
    pointer.out = event;
    pointer.outTarget = event.target;
  },
  touchend: function(inEvent) {
    this.dedupSynthMouse(inEvent);
    this.processTouches(inEvent, this.upOut);
  },
  upOut: function(inPointer) {
    if (!this.scrolling) {
      dispatcher.up(inPointer);
      dispatcher.leaveOut(inPointer);
    }
    this.cleanUpPointer(inPointer);
  },
  touchcancel: function(inEvent) {
    this.processTouches(inEvent, this.cancelOut);
  },
  cancelOut: function(inPointer) {
    dispatcher.cancel(inPointer);
    dispatcher.leaveOut(inPointer);
    this.cleanUpPointer(inPointer);
  },
  cleanUpPointer: function(inPointer) {
    pointermap.delete(inPointer.pointerId);
    this.removePrimaryPointer(inPointer);
  },

  // prevent synth mouse events from creating pointer events
  dedupSynthMouse: function(inEvent) {
    var lts = mouseEvents.lastTouches;
    var t = inEvent.changedTouches[0];

    // only the primary finger will synth mouse events
    if (this.isPrimaryTouch(t)) {

      // remember x/y of last touch
      var lt = { x: t.clientX, y: t.clientY };
      lts.push(lt);
      var fn = (function(lts, lt) {
        var i = lts.indexOf(lt);
        if (i > -1) {
          lts.splice(i, 1);
        }
      }).bind(null, lts, lt);
      setTimeout(fn, DEDUP_TIMEOUT);
    }
  }
};

INSTALLER = new Installer(touchEvents.elementAdded, touchEvents.elementRemoved,
  touchEvents.elementChanged, touchEvents);

export default touchEvents;
