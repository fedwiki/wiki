module.exports = function( grunt ) {

  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    authors: {
      prior: [
        "Nick Niemeir <nick.niemeir@gmail.com>",
        "Ward Cunningham <ward@c2.com>",
        "Paul Rodwell <paul.rodwell@btinternet.com>"
      ]
    }
  });

  grunt.registerTask( "update-authors", function () {
  var getAuthors = require("grunt-git-authors"),
  done = this.async();

  getAuthors({
    priorAuthors: grunt.config( "authors.prior")
  }, function(error, authors) {
    if (error) {
      grunt.log.error(error);
      return done(false);
    }

    grunt.file.write("AUTHORS.txt",
    "Authors ordered by first contribution\n\n" +
    authors.join("\n") + "\n");
  });
});


}
