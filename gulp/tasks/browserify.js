var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var babelify = require('babelify');
var handleErrors = require('../util/handleErrors');
var source = require('vinyl-source-stream');

var dest = './build'

gulp.task('browserify', function() {
  return browserify({
    entries: ['./client/index.js'],
    extensions: ['.js', '.jsx'],
    paths: ['./node_modules','./client/js/'],
    debug: true
  })
  .transform(babelify, {presets: ['es2015', 'react']})
  .bundle()
  .on('error', handleErrors)
  .pipe(source('./client/index.js'))
  .pipe(gulp.dest(dest));
});
