define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');

	registerSuite({
		name: 'pointerevent_button_attribute_mouse-manual',

		main: function() {
			return w3cTest(this.remote, 'pointerevent_button_attribute_mouse-manual.html')
				.findById('target0')
					.moveMouseTo()
				.end()
				.checkResults();
		}
	});
});
