var gulp = require('gulp')
var gutil = require('gulp-util')

var noWorkers = './client/!(workers)/*.js'

gulp.task('watch', function() {
  gulp.watch('./client/workers/*.js', ['workers'])
  gulp.watch(noWorkers, ['browserify'])
  gulp.watch('./client/**/*.jsx', ['browserify'])
  gulp.watch('./client/**/*.png', ['images'])
  gulp.watch('./client/**/*.styl', ['styles'])
  gulp.watch('./client/*.jade', ['jade'])
})
