var gulp = require('gulp')
var del = require('del')
var gutil = require('gulp-util')
var handleErrors = require('../util/handleErrors')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var pump = require('pump')

var dest = './build/workers'
var workerPath = './client/workers/*'
var builtWorker = './build/workers/*'

var shouldUglify = process.env.ENV == 'production'

gulp.task('worker-copy', function() {
  if (shouldUglify) {
    return pump([
      gulp.src(workerPath),
      uglify(),
      gulp.dest(dest)
    ])
  } else {
    return gulp.src(workerPath).pipe(gulp.dest(dest))
  }
})

gulp.task('worker-del', function (cb) {
  del([builtWorker], cb)
})

gulp.task('workers', ['worker-del', 'worker-copy'])
