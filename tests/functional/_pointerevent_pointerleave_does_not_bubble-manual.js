define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_pointerleave_does_not_bubble-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findByXpath('id("instructions")')
					.moveMouseTo(90, 21.859375)
					.clickMouseButton(0)
					.end()
				.findByXpath('id("complete-notice")')
					.moveMouseTo(97, 29.859375)
					.clickMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
