var gulp = require('gulp');
var jade = require('gulp-jade');
var changed = require('gulp-changed');

var dest = './build';

/**
 * Compile ./client/index.jade to ./build/index.html
 */
gulp.task('jade', function() {
  return gulp.src(['./client/index.jade'])
    .pipe(jade())
    .pipe(changed(dest))
    .pipe(gulp.dest(dest));
});
