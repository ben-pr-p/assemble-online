var gulp = require('gulp')
var changed = require('gulp-changed')
var imagemin = require('gulp-imagemin')

/**
 * Move ./client/img/*.png to ./build/img/*.png, ignored unchanged files and minimizing them
 */
gulp.task('images', function() {
  var dest = './build/img'

  return gulp.src('./client/img/**')
    .pipe(changed(dest))
    .pipe(imagemin())
    .pipe(gulp.dest(dest))
})
