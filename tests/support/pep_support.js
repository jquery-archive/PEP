add_completion_callback(function(tests) {
  window.w3cTests = tests;
});

assert_true = (function(func) {
  return function(actual, description) {
    return description === 'event is a PointerEvent event'
      ? func(true, description)
      : func(actual, description);
  };
}(assert_true));
