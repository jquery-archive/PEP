define(function(require) {
	var registerSuite = require('intern!object');
	var w3cTest = require('../support/w3cTest');
	var name = 'pointerevent_pointerleave_descendants-manual';

	registerSuite({
		name: name,

		main: function() {
			return w3cTest(this.remote, name + '.html')
				.findById('target0')
					.moveMouseTo(200, 10)
					.end()
				.findByCssSelector('#target0 div')
					.moveMouseTo(200, 10)
					.moveMouseTo(200, 150)
					.end()
				.checkResults();
		}
	});
});
