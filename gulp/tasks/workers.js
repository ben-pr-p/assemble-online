var gulp = require('gulp')
var gutil = require('gulp-util')
var handleErrors = require('../util/handleErrors')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var browserify = require('browserify')
var babelify = require('babelify')

var dest = './build/workers'

var shouldUglify = process.env.ENV == 'production'

gulp.task('workers', function (cb) {
  var js = browserify({
    entries: ['./client/workers/foreman.js'],
    extensions: ['.js'],
    paths: ['./node_modules','./client'],
    debug: true
  })
  .transform(babelify, {presets: ['es2015']})
  .bundle()
  .on('error', handleErrors)
  .pipe(source('./client/workers/foreman.js'))

  if (shouldUglify) {
    js = js.pipe(buffer()).pipe(uglify())
  }

  return js.pipe(gulp.dest(dest))
})
