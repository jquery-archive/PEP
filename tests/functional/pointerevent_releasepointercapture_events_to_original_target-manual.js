define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_releasepointercapture_events_to_original_target-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('target0')
					.moveMouseTo(50, 25)
					.pressMouseButton(0)
					.moveMouseTo(60, 25)
					.releaseMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
