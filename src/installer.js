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
    watchSubtree: function(inScope) {
      new MutationSummary({
        callback: boundWatcher,
        rootNode: inScope,
        queries: [{element: this.SELECTOR}]
      });
    },
    enableOnSubtree: function(inScope) {
      // TODO(dfreedman): need to handle no MO and touch events (old webkit)
      var scope = inScope || document;
      this.watchSubtree(inScope);
      if (scope === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.findElements(scope);
      }
    },
    installOnDocument: function() {
      this.elementAdded(document);
    },
    findElements: function(inScope) {
      var scope = inScope || document;
      if (scope.querySelectorAll) {
        var nl = scope.querySelectorAll(this.SELECTOR);
        forEach(nl, this.elementAdded, this);
      }
    },
    elementRemoved: function(inEl) {
      dispatcher.unregisterTarget(inEl);
    },
    elementAdded: function(inEl) {
      dispatcher.registerTarget(inEl);
    },
    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      var fn = function() { this.findElements() }.bind(this);
      document.addEventListener('DOMContentLoaded', fn);
    },
    summaryWatcher: function(inSummaries) {
      inSummaries.forEach(this.summaryHandler, this);
    },
    summaryHandler: function(inSummary) {
      inSummary.added.forEach(this.elementAdded, this);
      inSummary.removed.forEach(this.elementRemoved, this);
    },
  };
  var boundWatcher = installer.summaryWatcher.bind(installer);
  scope.installer = installer;
  scope.enablePointerEvents = installer.enableOnSubtree.bind(installer);
})(window.__PointerEventShim__);
