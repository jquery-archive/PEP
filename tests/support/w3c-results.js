define(function(require) {
	var assert = require('intern/chai!assert');

	return {
		getResults: function() {
			return window.w3cTests;
		},

		propagateResults: function(tests) {
			var statusToCode = {};
			["PASS", "FAIL", "TIMEOUT", "NOTRUN"].forEach(function(status) {
				statusToCode[status] = tests[0][status];
			});

			// Treat all tests as either pass or fail and just pass along the message
			tests.forEach(function(test) {
				assert.ok(test.status == statusToCode.PASS, test.message);
			});
		}
	};
});
