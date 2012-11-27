/*!
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module uses Mutation Observers to dynamically adjust which nodes will
 * generate Pointer Events.
 *
 * All nodes that wish to generate Pointer Events must have the attribute
 * `touch-action` set to `none`.
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
      var MO = window.WebKitMutationObserver || window.MutationObserver;
      if (!MO) {
        // This UA has no Mutation Observer, falling back to document listener
        this.installOnDocument();
        return;
      }
      var watcher = this.mutationWatcher.bind(this);
      var observer = new MO(watcher);
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['touch-action']
      });
      this.installOnLoad();
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
    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('DOMContentLoaded', this.findElements.bind(this));
    },
    // only nodes with `touch-action = none` attribute need to fire events
    shouldListen: function(inEl) {
      return inEl.getAttribute && inEl.getAttribute('touch-action') === 'none';
    },
    mutationWatcher: function(inMutations) {
      inMutations.forEach(this.mutationHandler.bind(this));
    },
    mutationHandler: function(inMutation) {
      // a node with touch-action has changed value
      if (inMutation.type === 'attributes') {
        var t = inMutation.target;
        if (this.shouldListen(t)) {
          this.elementAdded(t);
        } else {
          this.elementRemoved(t);
        }
      } else if (inMutation.type === 'childList') {
        // nodes were removed, remove listeners (noop on nodes without)
        forEach(inMutation.removedNodes, this.elementRemoved);
        // new nodes added, they may have `touch-action: none`
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
