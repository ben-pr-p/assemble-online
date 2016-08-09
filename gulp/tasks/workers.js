var gulp = require('gulp')
var del = require('del')
var gutil = require('gulp-util')
var handleErrors = require('../util/handleErrors')

var dest = './build/workers'
var workerPath = './client/workers/*'
var builtWorker = './build/workers/*'

gulp.task('worker-copy', function() {
  gulp.src(workerPath)
  .on('error', handleErrors)
  .pipe(gulp.dest(dest))
})

gulp.task('worker-del', function (cb) {
  del([builtWorker], cb)
})

gulp.task('workers', ['worker-del', 'worker-copy'])
