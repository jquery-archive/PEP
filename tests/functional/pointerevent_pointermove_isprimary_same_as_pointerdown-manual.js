define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_pointermove_isprimary_same_as_pointerdown-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('target0')
					.moveMouseTo(175, 40)
					.pressMouseButton(0)
					.moveMouseTo(200, 40)
					.releaseMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
