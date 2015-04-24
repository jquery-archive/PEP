define(function(require) {
	var registerSuite = require('intern!object');
	var w3cResults = require('../support/w3c-results');
	var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

	registerSuite({
		name: 'pointerevent_button_attribute_mouse-manual',

		main: function() {
			return this.remote
				.get(require.toUrl('pointerevents/pointerevent_button_attribute_mouse-manual.html'))
				.findById('target0')
					.moveMouseTo()
				.end()
				.then(pollUntil(w3cResults.getResults, 1000))
				.then(w3cResults.propagateResults);
		}
	});
});
