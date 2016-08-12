var gulp = require('gulp')
var gutil = require('gulp-util')
var browserify = require('browserify')
var babelify = require('babelify')
var handleErrors = require('../util/handleErrors')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')

var dest = './build'

var shouldUglify = process.env.ENV == 'production'

gulp.task('browserify', function() {
  var js = browserify({
    entries: ['./client/room.js'],
    extensions: ['.js', '.jsx'],
    paths: ['./node_modules','./client/js/'],
    debug: true
  })
  .transform(babelify, {presets: ['es2015', 'react']})
  .bundle()
  .on('error', handleErrors)
  .pipe(source('./client/room.js'))

  if (shouldUglify) {
    js = js.pipe(buffer()).pipe(uglify())
  }

  return js.pipe(gulp.dest(dest))
})
