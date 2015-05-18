/**
 * This module implements an map of pointer states
 */
var USE_EXISTING_MAP = window.Map && window.Map.prototype.forEach;
function Map() {
  if (USE_EXISTING_MAP) {
    return new window.Map();
  } else {
    this.keys = [];
    this.values = [];
  }
}

Map.prototype = {
  set: function(inId, inEvent) {
    var i = this.keys.indexOf(inId);
    if (i > -1) {
      this.values[i] = inEvent;
    } else {
      this.keys.push(inId);
      this.values.push(inEvent);
    }
  },
  has: function(inId) {
    return this.keys.indexOf(inId) > -1;
  },
  delete: function(inId) {
    var i = this.keys.indexOf(inId);
    if (i > -1) {
      this.keys.splice(i, 1);
      this.values.splice(i, 1);
    }
  },
  get: function(inId) {
    var i = this.keys.indexOf(inId);
    return this.values[i];
  },
  clear: function() {
    this.keys.length = 0;
    this.values.length = 0;
  },

  // return value, key, map
  forEach: function(callback, thisArg) {
    this.values.forEach(function(v, i) {
      callback.call(thisArg, v, this.keys[i], this);
    }, this);
  },
  get size() {
    return this.keys.length;
  }
};

export default Map;
