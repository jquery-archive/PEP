define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_setpointercapture_relatedtarget-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('target0')
					.moveMouseTo(50, 25)
					.end()
				.findById('target1')
					.moveMouseTo(50, 25)
					.end()
				.findById('btnCapture')
					.moveMouseTo(50, 4)
					.pressMouseButton(0)
					.end()
				.findById('target1')
					.moveMouseTo(50, 25)
					.end()
				.findById('target0')
					.moveMouseTo(50, 25)
					.releaseMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
