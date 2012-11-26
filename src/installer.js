/*!
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var installer = {
    SELECTOR: '[touch-action=none]',
    installOnDocument: function() {
      this.elementAdded(document);
    },
    installOnElements: function() {
      var fn = this.installOnLoad.bind(this);
      document.addEventListener('DOMContentLoaded', fn);
      var watcher = this.mutationWatcher.bind(this);
      var MO = window.WebKitMutationObserver || window.MutationObserver;
      var observer = new MO(watcher);
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['touch-action']
      });
    },
    findElements: function() {
      var nl = document.querySelectorAll(this.SELECTOR);
      forEach(nl, this.elementAdded);
    },
    elementRemoved: function(inEl) {
      dispatcher.unregisterTarget(inEl);
    },
    elementAdded: function(inEl) {
      dispatcher.registerTarget(inEl);
    },
    installOnLoad: function() {
      this.findElements();
    },
    shouldListen: function(inEl) {
      return inEl.getAttribute && inEl.getAttribute('touch-action') === 'none';
    },
    mutationWatcher: function(inMutations) {
      inMutations.forEach(this.mutationHandler.bind(this));
    },
    mutationHandler: function(inMutation) {
      if (inMutation.type === 'attributes') {
        var t = inMutation.target;
        if (this.shouldListen(t)) {
          this.elementAdded(t);
        } else {
          this.elementRemoved(t);
        }
      } else if (inMutation.type === 'childList') {
        forEach(inMutation.removedNodes, this.elementRemoved);
        forEach(inMutation.addedNodes, function(n) {
          if (this.shouldListen(n)) {
            this.elementAdded(n);
          }
        }.bind(this));
      }
    },
  };
  scope.installer = installer;
})(window.__PointerEventShim__);
