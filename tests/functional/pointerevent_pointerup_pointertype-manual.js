define(function(require) {
  var registerSuite = require('intern!object');
  var w3cTest = require('../support/w3cTest');
  var name = 'pointerevent_pointerup_pointertype-manual';

  registerSuite({
    name: name,

    main: function() {
      return w3cTest(this.remote, name + '.html')
        .findById('target0')
          .moveMouseTo(50, 25)
          .clickMouseButton(0)
          .end()
        .checkResults();
    }
  });
});
