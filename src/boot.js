/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  scope = scope || {};
  var target = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(scope) {
      return scope && Boolean(scope.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr, os;
        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {
          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {
            // check for older shadows
            os = sr.querySelector('shadow');
            // check the older shadow if available
            sr = os && os.olderShadowRoot;
          } else {
            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }
        // light dom element is the target
        return t;
      }
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX, y = inEvent.clientY;
      return this.searchRoot(document, x, y);
    }
  };
  scope.targetFinding = target;
  scope.findTarget = target.findTarget.bind(target);

  var bounds = {
    ANCESTOR: Node.DOCUMENT_POSITION_CONTAINS,
    DESCENDANT: Node.DOCUMENT_POSITION_CONTAINED_BY,
    compare: function(a, b) {
      if (!a || !b) {
        return 0;
      }
      // TODO(dfreedman): workaround for ShadowDOMPolyfill
      // https://github.com/toolkitchen/ShadowDOM/issues/134
      if (b.impl && window.ShadowDOMPolyfill) {
        b = ShadowDOMPolyfill.unwrap(b);
      }
      return a.compareDocumentPosition(b);
    },
    // order is reversed because the comparison is relatedTarget to target
    isAncestor: function(target, relatedTarget) {
      return Boolean(this.compare(target, relatedTarget) & this.DESCENDANT);
    },
    isDescendant: function(target, relatedTarget) {
      return Boolean(this.compare(target, relatedTarget) & this.ANCESTOR);
    }
  };
  scope.bounds = bounds;
  scope.isAncestor = bounds.isAncestor.bind(bounds);

  window.PointerEventsPolyfill = scope;
})(window.PointerEventsPolyfill);
