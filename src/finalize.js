/*
 * Copyright 2012 The Toolkit Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(scope) {
  if (!scope.keep) {
    delete window.PointerEventShim;
  }
})(window.PointerEventShim);
