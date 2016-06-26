var gulp = require('gulp');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');

/**
 * Move ./client/fonts/*.ttf to ./build/fonts/*.ttf, ignored unchanged files 
 */

gulp.task('fonts', function() {
  var dest = './build/fonts';

  return gulp.src('./client/fonts/**')
    .pipe(changed(dest))
    .pipe(gulp.dest(dest));
});
