var gulp = require('gulp');
var stylus = require('gulp-stylus');
var handleErrors = require('../util/handleErrors');

var dest = './build'

/**
 * Compile ./client/index.styl (and all styles since index imports everything) to ./www/index.css
 */
gulp.task('styles', function () {
  return gulp.src(['./client/index.styl'])
    .pipe(stylus())
    .on('error', handleErrors)
    .pipe(gulp.dest(dest));
});
