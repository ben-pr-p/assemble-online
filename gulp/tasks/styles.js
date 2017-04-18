const gulp = require('gulp')
const stylus = require('gulp-stylus')
const handleErrors = require('../util/handleErrors')
const clientapps = require('./client-apps')

const dest = './build'

function generate (stylname) {
  return function () {
    return gulp.src([`./client/${stylname}`])
      .pipe(stylus({
        'include css': true
      }))
      .on('error', handleErrors)
      .pipe(gulp.dest(dest))
  }
}

const stylroots = clientapps.map(root => `${root}.styl`)
stylroots.forEach(styl => {
  gulp.task(styl, generate(styl))
})

gulp.task('styles', stylroots)
