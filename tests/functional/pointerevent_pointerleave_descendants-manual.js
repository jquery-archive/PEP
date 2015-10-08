define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_pointerleave_descendants-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('target0')
					.moveMouseTo(50, 0)
					.clickMouseButton(0)
					.end()
				.findByXpath('id("target0")/div')
					.moveMouseTo(50, 0)
					.clickMouseButton(0)
					.end()
				.findById('target0')
					.moveMouseTo(50, 0)
					.clickMouseButton(0)
					.end()
				.findByXpath('/html/body[1]/h4[1]/p')
					.moveMouseTo(50, 0)
					.clickMouseButton(0)
					.end()
				.checkResults();
		}
	});
});
