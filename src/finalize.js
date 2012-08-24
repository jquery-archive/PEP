(function(scope) {
    if (!scope.keep) {
        delete window.PointerEventShim;
    }
})(window.PointerEventShim);
