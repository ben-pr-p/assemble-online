var gulp = require('gulp')
var stylus = require('gulp-stylus')
var handleErrors = require('../util/handleErrors')

var dest = './build'

function generate (stylname) {
  return function () {
    return gulp.src([`./client/${stylname}`])
      .pipe(stylus())
      .on('error', handleErrors)
      .pipe(gulp.dest(dest))
  }
}

var stylroots = ['room.styl', 'portal.styl']
stylroots.forEach(styl => {
  gulp.task(styl, generate(styl))
})

gulp.task('styles', stylroots)
