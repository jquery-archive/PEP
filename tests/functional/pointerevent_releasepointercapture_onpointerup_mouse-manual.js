define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_releasepointercapture_onpointerup_mouse-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('btnCapture')
					.moveMouseTo(50, 0)
					.pressMouseButton(0)
					.end()
				.findByTagName('body')
					.moveMouseTo(50, 360)
					.releaseMouseButton(0)
					.end()
			  .checkResults();
		}
	});
});
