/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/*
 * This module implements an ordered list of pointer states
 * Each pointer object here has three properties:
 *  - id: the id of the pointer
 *  - event: the source event of the pointer, complete with positions
 *  - state: extra state the pointer needs to carry
 *
 * The ordering of the pointers is from oldest pointer to youngest pointer,
 * which allows for multi-pointer gestures to not rely on the actual ids
 * imported from the source events.
 */
(function(scope) {
  var pointermap = {
    // pointers is an array of pointer states, ordered from oldest to youngest
    pointers: [],
    addPointer: function(inId, inSrcEvent, inState) {
      var p = {id: inId, event: inSrcEvent, state: inState};
      this.pointers.push(p);
    },
    removePointer: function(inId) {
      var i = this.getPointerIndex(inId);
      if (i > -1) {
        this.pointers.splice(i, 1);
      }
    },
    getPointerById: function(inId) {
      return this.pointers[this.getPointerIndex(inId)];
    },
    getPointerIndex: function(inId) {
      for (var i = 0, l = this.pointers.length, p; (i < l) && (p = this.pointers[i]); i++) {
        if (p.id === inId) {
          return i;
        }
      }
      return -1;
    },
    getPointerList: function() {
      return this.pointers;
    }
  };
  scope.pointermap = pointermap;
})(window.PointerEventShim);
