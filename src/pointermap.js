/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var pointermap = {
    // pointers is an array of pointer states, ordered from oldest to youngest
    pointers: [],
    addPointer: function(inPointer) {
      this.pointers.push(inPointer);
    },
    removePointer: function(inId) {
      var p = this.getPointerById(inId);
      if (p) {
        var i = this.pointers.indexOf(p);
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
    },
    updatePointer: function(inId, inPointer) {
      var i = this.getPointerIndex(inId);
      this.pointers[i] = inPointer;
    }
  };
  scope.pointermap = pointermap;
})(window.PointerEventShim);
