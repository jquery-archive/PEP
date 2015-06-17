define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');

	registerSuite({
		name: 'pointerevent_capture_mouse-manual',

		main: function() {
			return w3cTest(this.remote, 'pointerevent_capture_mouse-manual.html')
				.findById('target0')
					.moveMouseTo()
				.end()
				.findById('target1')
					.moveMouseTo()
				.end()
				.findById('btnCapture')
					.moveMouseTo()
					.pressMouseButton()
				.end()
				.findById('target1')
					.moveMouseTo()
				.end()
				.findById('target0')
					.moveMouseTo()
					.releaseMouseButton()
				.end()
				.checkResults();
		}
	});
});
