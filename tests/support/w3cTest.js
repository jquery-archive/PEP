define(function(require) {
	var Command = require('intern/dojo/node!leadfoot/Command');
	var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
	var assert = require('intern/chai!assert');

	var path = require('intern/dojo/node!path');
	var testPkg = require('intern/dojo/node!../../package')['web-platform-tests'];
	var testPath = path.normalize(testPkg.path);

	function w3cTest(remote, url) {
		return new CustomCommand(remote)
			.get(require.toUrl(path.join(testPath, url)))
			.setExecuteAsyncTimeout(1000);
	}

	function propagateResults(tests) {
		var statusToCode = {};
		['PASS', 'FAIL', 'TIMEOUT', 'NOTRUN'].forEach(function(status) {
			statusToCode[status] = tests[0][status];
		});

		// Treat all tests as either pass or fail and just pass along the message
		tests.forEach(function(test) {
			assert.ok(test.status === statusToCode.PASS, test.message);
		});
	}

	function CustomCommand() {
		Command.apply(this, arguments);
	}
	CustomCommand.prototype = Object.create(Command.prototype);
	CustomCommand.prototype.constructor = CustomCommand;

	CustomCommand.prototype.checkResults = function() {
		return new this.constructor(this, function() {
			return this.parent
				.then(pollUntil(function() {
					return window.w3cTests;
				}, 1000))
				.then(propagateResults);
		});
	};

	return w3cTest;
});
