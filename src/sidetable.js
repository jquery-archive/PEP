/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// SideTable is a weak map where possible. If WeakMap is not available the
// association is stored as an expando property.
var SideTable;
if (typeof WeakMap !== 'undefined') {
  SideTable = WeakMap;
} else {
  SideTable = function(name) {
    this.name = '__$' + name + '$__';
  };
  SideTable.prototype = {
    set: function(key, value) {
      Object.defineProperty(key, this.name, {value: value, writable: true});
    },
    get: function(key) {
      return key[this.name];
    }
  }
}
