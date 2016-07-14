var fs = require("fs");
var path = require("path");

module.exports = function(Release) {

Release.define({
	issueTracker: "github",
	cdnPublish: "dist",
	npmPublish: true,

	changelogShell: function() {
		return "# " + Release.newVersion + " Changelog\n";
	},

	generateArtifacts: function(callback) {
		Release.exec("grunt");

		// Update version references in README.md
		var readmePath = path.join(Release.dir.repo, "README.md");
		var readme = fs.readFileSync(readmePath, "utf8").replace(
			/pep\/\d+\.\d+\.\d+\/pep\.js/g,
			"pep/" + Release.newVersion + "/pep.js"
		);
		fs.writeFileSync(readmePath, readme);

		callback([
			"README.md",
			"dist/pep.js",
			"dist/pep.min.js"
		]);
	}
});

};
