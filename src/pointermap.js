/**
 * This module implements a map of pointer states
 */
var USE_MAP = window.Map && window.Map.prototype.forEach;
var PointerMap = USE_MAP ? Map : SparseArrayMap;

function SparseArrayMap() {
  this.array = [];
  this.size = 0;
}

SparseArrayMap.prototype = {
  set: function(k, v) {
    if (v === undefined) {
      return this.delete(k);
    }
    if (!this.has(k)) {
      this.size++;
    }
    this.array[k] = v;
  },
  has: function(k) {
    return this.array[k] !== undefined;
  },
  delete: function(k) {
    if (this.has(k)) {
      delete this.array[k];
      this.size--;
    }
  },
  get: function(k) {
    return this.array[k];
  },
  clear: function() {
    this.array.length = 0;
    this.size = 0;
  },

  // return value, key, map
  forEach: function(callback, thisArg) {
    return this.array.forEach(function(v, k) {
      callback.call(thisArg, v, k, this);
    }, this);
  }
};

export default PointerMap;
