var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('watch', function() {
  gulp.watch('./client/**/*.js', ['browserify']);
  gulp.watch('./client/**/*.jsx', ['browserify']);
  gulp.watch('./client/**/*.png', ['images']);
  gulp.watch('./client/**/*.styl', ['styles']);
  gulp.watch('./client/*.jade', ['jade']);
});
