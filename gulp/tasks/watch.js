var gulp = require('gulp')
var gutil = require('gulp-util')
var clientapps = require('./client-apps')

gulp.task('watch', function() {
  gulp.watch('./client/workers/**/*.js', ['workers'])
  gulp.watch('./client/lib/**/*.js', ['browserify'])
  gulp.watch('./client/common/**/*.js', ['browserify'])
  gulp.watch('./client/common/**/*.jsx', ['browserify'])
  gulp.watch('./client/**/*.png', ['images'])
  gulp.watch('./client/**/*.styl', ['styles'])

  clientapps.forEach(root => {
    var glob = `./client/${root}/**/*.jsx`
    var glob1 = `./client/${root}/**/*.js`
    var task = `${root}.js`
    gulp.watch(glob, [task])
    gulp.watch(glob1, [task])
  })
})
