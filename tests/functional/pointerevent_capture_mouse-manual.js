define(function(require) {
	var registerSuite = require('intern!object');
	var w3cResults = require('../support/w3c-results');
	var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');

	registerSuite({
		name: 'pointerevent_capture_mouse-manual',

		main: function() {
			return this.remote
				.get(require.toUrl('pointerevents/pointerevent_capture_mouse-manual.html'))
				.findById('target0')
					.moveMouseTo()
				.end()
				.findById('target1')
					.moveMouseTo()
				.end()
				.findById('btnCapture')
					.moveMouseTo()
					.pressMouseButton()
				.end()
				.findById('target1')
					.moveMouseTo()
				.end()
				.findById('target0')
					.moveMouseTo()
					.releaseMouseButton()
				.end()
				.then(pollUntil(w3cResults.getResults, 1000))
				.then(w3cResults.propagateResults);
		}
	});
});
