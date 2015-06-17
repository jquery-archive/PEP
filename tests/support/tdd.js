define(['intern!tdd'], function(tdd) {
  function catchGlobalErrors(testFn) {
    return function() {
      var promise = testFn.apply(this, arguments);

      if (promise && promise.then || this.isAsync) {
        var dfd = this.async();

        if (promise && promise !== dfd.promise) {
          promise.then(dfd.resolve.bind(dfd), dfd.reject.bind(dfd));
        }

        var originalHandler = window.onerror;
        window.onerror = function(message, url, line, column, error) {
          dfd.reject(error || new Error(message));
        };

        return dfd.promise.then(function(returnValue) {
          window.onerror = originalHandler;
          return returnValue;
        }, function(error) {
          window.onerror = originalHandler;
          throw error;
        });
      }
    };
  }

  var autoCapturingTdd = Object.create(tdd);
  autoCapturingTdd.test = function(name, test) {
    tdd.test(name, catchGlobalErrors(test));
  };

  return autoCapturingTdd;
});
