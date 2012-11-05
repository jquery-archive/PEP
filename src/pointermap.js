/*!
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module implements an ordered list of pointer states
 * Each pointer object here has two properties:
 *  - id: the id of the pointer
 *  - event: the source event of the pointer, complete with positions
 *
 * The ordering of the pointers is from oldest pointer to youngest pointer,
 * which allows for multi-pointer gestures to not rely on the actual ids
 * imported from the source events.
 *
 * Any operation that needs to store state information about pointers can hang
 * objects off of the pointer in the pointermap. This information will be
 * preserved until the pointer is removed from the pointermap.
 */
function PointerMap() {
  this.pointers = [];
};

PointerMap.prototype = {
  addPointer: function(inId) {
    var p = {id: inId};
    this.pointers.push(p);
    return p;
  },
  removePointer: function(inId) {
    var i = this.indexOf(inId);
    if (i > -1) {
      return this.pointers.splice(i, 1)[0];
    }
  },
  getPointer: function(inId) {
    return this.pointers[this.indexOf(inId)];
  },
  indexOf: function(inId) {
    for (var i = 0, l = this.pointers.length, p; (i < l) && (p = this.pointers[i]); i++) {
      if (p.id === inId) {
        return i;
      }
    }
    return -1;
  },
  size: function() {
    return this.pointers.length;
  }
};
