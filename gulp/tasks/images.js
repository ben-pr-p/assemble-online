const gulp = require('gulp')
const changed = require('gulp-changed')
const imagemin = require('gulp-imagemin')

/**
 * Move ./client/img/*.png to ./build/img/*.png, ignored unchanged files and minimizing them
 */
gulp.task('images', () => {
  const dest = './build/img'

  return gulp.src('./client/img/**')
    .pipe(changed(dest))
    .pipe(imagemin())
    .pipe(gulp.dest(dest))
})
