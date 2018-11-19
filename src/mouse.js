import dispatcher from './dispatcher';

var pointermap = dispatcher.pointermap;

// radius around touchend that swallows mouse events
var DEDUP_DIST = 25;

// left, middle, right, back, forward
var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

var HAS_BUTTONS = false;
try {
  HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
} catch (e) {}

// handler block for native mouse events
var mouseEvents = {
  POINTER_ID: 1,
  POINTER_TYPE: 'mouse',
  events: [
    'mousedown',
    'webkitmouseforcechanged',
    'mousemove',
    'mouseup',
    'mouseover',
    'mouseout'
  ],
  register: function(target) {
    dispatcher.listen(target, this.events);
  },
  unregister: function(target) {
    dispatcher.unlisten(target, this.events);
  },
  lastTouches: [],

  // collide with the global mouse listener
  isEventSimulatedFromTouch: function(inEvent) {
    var lts = this.lastTouches;
    var x = inEvent.clientX;
    var y = inEvent.clientY;
    for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

      // simulated mouse events will be swallowed near a primary touchend
      var dx = Math.abs(x - t.x);
      var dy = Math.abs(y - t.y);
      if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
        return true;
      }
    }
  },
  prepareEvent: function(inEvent) {
    var e = dispatcher.cloneEvent(inEvent);

    // forward mouse preventDefault
    var pd = e.preventDefault;
    e.preventDefault = function() {
      inEvent.preventDefault();
      pd();
    };
    e.pointerId = this.POINTER_ID;
    e.isPrimary = true;
    e.pointerType = this.POINTER_TYPE;
    if ('webkitForce' in inEvent) {
      e.pressure = inEvent.webkitForce - MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN;
    }
    return e;
  },
  prepareButtonsForMove: function(e, inEvent) {
    var p = pointermap.get(this.POINTER_ID);

    // Update buttons state after possible out-of-document mouseup.
    if (inEvent.which === 0 || !p) {
      e.buttons = 0;
    } else {
      e.buttons = p.buttons;
    }
    inEvent.buttons = e.buttons;
  },
  mousedown: function(inEvent) {
    if (!this.isEventSimulatedFromTouch(inEvent)) {
      var p = pointermap.get(this.POINTER_ID);
      var e = this.prepareEvent(inEvent);
      if (!HAS_BUTTONS) {
        e.buttons = BUTTON_TO_BUTTONS[e.button];
        if (p) { e.buttons |= p.buttons; }
        inEvent.buttons = e.buttons;
      }
      pointermap.set(this.POINTER_ID, inEvent);
      if (!p || p.buttons === 0) {
        dispatcher.down(e);
      } else {
        dispatcher.move(e);
      }
    }
  },

  // This is called when the user force presses without moving x/y
  webkitmouseforcechanged: function(inEvent) {
    this.mousemove(inEvent);
  },
  mousemove: function(inEvent) {
    if (!this.isEventSimulatedFromTouch(inEvent)) {
      var e = this.prepareEvent(inEvent);
      if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
      e.button = -1;
      pointermap.set(this.POINTER_ID, inEvent);
      dispatcher.move(e);
    }
  },
  mouseup: function(inEvent) {
    if (!this.isEventSimulatedFromTouch(inEvent)) {
      var p = pointermap.get(this.POINTER_ID);
      var e = this.prepareEvent(inEvent);
      if (!HAS_BUTTONS) {
        var up = BUTTON_TO_BUTTONS[e.button];

        // Produces wrong state of buttons in Browsers without `buttons` support
        // when a mouse button that was pressed outside the document is released
        // inside and other buttons are still pressed down.
        e.buttons = p ? p.buttons & ~up : 0;
        inEvent.buttons = e.buttons;
      }
      pointermap.set(this.POINTER_ID, inEvent);

      // Support: Firefox <=44 only
      // FF Ubuntu includes the lifted button in the `buttons` property on
      // mouseup.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
      e.buttons &= ~BUTTON_TO_BUTTONS[e.button];
      if (e.buttons === 0) {
        dispatcher.up(e);
      } else {
        dispatcher.move(e);
      }
    }
  },
  mouseover: function(inEvent) {
    if (!this.isEventSimulatedFromTouch(inEvent)) {
      var e = this.prepareEvent(inEvent);
      if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
      e.button = -1;
      pointermap.set(this.POINTER_ID, inEvent);
      dispatcher.enterOver(e);
    }
  },
  mouseout: function(inEvent) {
    if (!this.isEventSimulatedFromTouch(inEvent)) {
      var e = this.prepareEvent(inEvent);
      if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
      e.button = -1;
      dispatcher.leaveOut(e);
    }
  },
  cancel: function(inEvent) {
    var e = this.prepareEvent(inEvent);
    dispatcher.cancel(e);
    this.deactivateMouse();
  },
  deactivateMouse: function() {
    pointermap.delete(this.POINTER_ID);
  }
};

export default mouseEvents;
