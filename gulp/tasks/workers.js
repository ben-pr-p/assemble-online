var gulp = require('gulp')
var del = require('del')
var gutil = require('gulp-util')
var handleErrors = require('../util/handleErrors')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var babel = require('gulp-babel')
var pump = require('pump')

var dest = './build/workers'
var workerPath = './client/workers/*'
var builtWorker = './build/workers/*'

var shouldUglify = process.env.ENV == 'production'

gulp.task('worker-copy', function(cb) {
  if (shouldUglify) {
    pump([
      gulp.src(workerPath),
      babel({presets: ['es2015']}),
      uglify(),
      gulp.dest(dest)
    ], cb)
  } else {
    pump([
      gulp.src(workerPath),
      babel({presets: ['es2015']}),
      gulp.dest(dest)
    ], cb)
  }
})

gulp.task('worker-del', function (cb) {
  del([builtWorker], cb)
})

gulp.task('workers', ['worker-copy'])
