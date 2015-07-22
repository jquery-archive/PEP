define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_lostpointercapture_is_first-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('btnCapture')
					.moveMouseTo(50, 4)
					.pressMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
