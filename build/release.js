module.exports = function( Release ) {

Release.define( {
	issueTracker: "github",
	cdnPublish: "dist",
	npmPublish: true,

	changelogShell: function() {
		return "# " + Release.newVersion + " Changelog\n";
	},

	generateArtifacts: function( callback ) {
		Release.exec( "grunt" );
		callback( [
			"dist/PEP.js",
			"dist/PEP.min.js"
		] );
	}
} );

};
