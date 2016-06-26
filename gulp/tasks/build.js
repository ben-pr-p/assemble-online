var gulp = require('gulp');
gulp.task('build', ['jade', 'browserify', 'styles', 'images', 'fonts']);