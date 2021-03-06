// `grunt build`
// Builds out an optimized site through (but not limited to) minification of CSS and HTML,
// as well as uglification and optimization of Javascript, and compression of images.

'use strict';

var taskConfig = function(grunt) {
  grunt.registerTask('build', 'Build a production ready version of your site.', [
    'clean:dist',<% if (useServer) { %>
    'env:prod',<% } %>
    'injector',
    'wiredep',
    'copy:dist',
    'concurrent',
    'useminPrepare',<% if (jsFramework === 'angular') { %>
    'ngtemplates:main',<% } %>
    'concat:generated',<% if (jsFramework === 'angular') { %>
    'ngAnnotate',<% } %>
    'cssmin',
    'autoprefixer:dist',
    'usemin',
    'htmlmin:dist',
    'uglify',
    'clean:tmp'
  ]);
};

module.exports = taskConfig;
