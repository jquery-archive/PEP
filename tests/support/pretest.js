/*jshint node: true */
var _ = require('lodash'),
	/*jshint -W079 */
	Promise = require('bluebird'),
	atob = require('atob'),
	/*jshint +W079 */
	fs = Promise.promisifyAll(require('fs-extra')),
	glob = Promise.promisify(require('glob')),
	path = require('path'),
	request = Promise.promisifyAll(require('request')),
	testPkg = require('../../package')['web-platform-tests'],
	url = require('url');

var basePath = path.join(__dirname, '..', '..'),
	testPath = path.join(basePath, testPkg.path),
	shaPath = path.join(testPath, '.sha'),
	token = 'Mjk5ZGQxNTk0ZDA3YTllY2I5YzlmMzRhZWYyOTEyZTQ1MDE2ZDdmNw==',
	treeUrl = 'https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}';

var harnessFiles = [
	'testharness.css',
	'testharness.js',
	'testharnessreport.js'
];

var reqOpts = {
	'headers': {
		'Authorization': 'token ' + atob(token),
		'User-Agent': 'request'
	}
};

var options = {
	'raw': function(entry) {
		return defaultsDeep({
			'url': entry,
			'headers': { 'Accept': 'application/vnd.github.v3.raw' }
		}, reqOpts);
	},
	'tree': function(entry) {
		if (url.parse(entry).hostname !== 'api.github.com') {
			entry = _.template(treeUrl)(parseRepoString(entry));
		}
		return defaultsDeep({ 'url': entry, 'json': true }, reqOpts);
	}
};

var defaultsDeep = _.partialRight(_.merge, function defaults(objVal, srcVal) {
	return objVal === undefined ? srcVal : _.merge(objVal, srcVal, defaults);
});

function parseRepoString(string) {
	var parts = String(string).match(/([^\/]+)\/([^#]+)#([\s\S]+)/);
	return {
		'owner': _.result(parts, 1, ''),
		'repo': _.result(parts, 2, ''),
		'sha': _.result(parts, 3, '')
	};
}

function getRaw(entry) {
	return request.getAsync(options.raw(entry)).then(
		function(res) { return _.result(res, 'body'); },
		function(err) { throw err; }
	);
}

function getTree(entry) {
	return request.getAsync(options.tree(entry)).then(
		function(res) { return _.result(res, 'body.tree'); },
		function(err) { throw err; }
	);
}

function getFiles(tree) {
	var pe = _.find(tree, { path: 'pointerevents' }),
		resources = _.find(tree, { path: 'resources' });

	return Promise.all([
		getTree(pe.url)
			.then(getTests),
		getTree('w3c/testharness.js#' + resources.sha)
			.then(getHarness)
	]);
}

function getTests(tree) {
	return Promise.all(_.map(tree, function(object) {
		if (object.type === 'tree') {
			return getTree(object.url).then(function(tree) {
				tree.forEach(function(node) {
					node.path = object.path + '/' + node.path
				});
				return getTests(tree);
			});
		}
		var $raw = getRaw(object.url);
		return $raw.then(function(raw) {
			return fs.outputFileAsync(path.join(testPath, object.path), raw, 'utf-8');
		});
	}));
}

function getHarness(tree) {
	return Promise.all(_.map(harnessFiles, function(hf) {
		var object = _.find(tree, { path: hf }),
			$raw = getRaw(object.url);

		return $raw.then(function(raw) {
			return fs.outputFileAsync(path.join(testPath, 'resources', object.path), raw, 'utf-8');
		});
	}));
}

function modFiles() {
	return glob(path.join(testPath, '**/*.html')).then(function(paths) {
		return Promise.all(_.map(paths, function(path) {
			return fs.readFileAsync(path, 'utf8')
				.then(function(source) {
					return modFile(source, path);
				})
				.then(function(source) {
					return fs.writeFileAsync(path, source, 'utf-8');
				});
		}));
	});
}

function modFile(source, filePath) {
	var fileDir = path.dirname(filePath);
	var pepPath = path.relative(fileDir, path.join(basePath, 'dist', 'pep.js'));
	var supPath = path.relative(fileDir, path.join(basePath, 'tests', 'support', 'pep_support.js')),

	// Ensure pep.js is the first script loaded on the page
	source = source.replace(/^\s*(?=<script\b|<\/head>)/im, '\n$&<script src="' + encodeURI(pepPath) + '"></script>\n$&');

	// Add "tests/support/pep_support.js" after "pointerevent_support.js"
	source = source.replace(/^(\s*)<script.*?pointerevent_support[\s\S]+?<\/script>\n/im, '$&$1<script src="' + encodeURI(supPath) + '"></script>\n');
	// Make paths to scripts and style sheets relative instead of absolute
	return source.replace(/((?:src|href)\s*=\s*['"])([^.])/g, function(match, prelude, chr) {
		return prelude + '.' + (chr === '/' ? '' : '/') + chr;
	});
}

module.exports = function() {
	var parsed = parseRepoString(testPkg.repo);
	if (fs.existsSync(shaPath) && fs.readFileSync(shaPath, 'utf-8') === parsed.sha) {
		return Promise.resolve();
	}
	fs.removeSync(testPath);
	fs.outputFileSync(shaPath, parsed.sha, 'utf-8');
	return getTree(testPkg.repo)
		.then(getFiles)
		.then(modFiles);
};
