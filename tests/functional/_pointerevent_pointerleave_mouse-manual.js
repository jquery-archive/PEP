define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_pointerleave_mouse-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findByTagName('body')
					.moveMouseTo(80, 90)
					.end()
				.findByTagName('body')
					.moveMouseTo(80, 150)
					.end()
				.checkResults();
		}
	});
});
