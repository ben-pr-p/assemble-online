var gulp = require('gulp')
var gutil = require('gulp-util')
var browserify = require('browserify')
var babelify = require('babelify')
var handleErrors = require('../util/handleErrors')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var uglify = require('gulp-uglify')
var clientapps = require('./client-apps')

var dest = './build'

var shouldUglify = process.env.ENV == 'production'

function generate (jsname) {
  return function () {
    var js = browserify({
      entries: [`./client/${jsname}`],
      extensions: ['.js', '.jsx'],
      paths: ['./node_modules','./client'],
      debug: true
    })
    .transform(babelify, {presets: ['es2015', 'react']})
    .bundle()
    .on('error', handleErrors)
    .pipe(source(`./client/${jsname}`))

    if (shouldUglify) {
      js = js.pipe(buffer()).pipe(uglify())
    }

    return js.pipe(gulp.dest(dest))
  }
}

var jsroots = clientapps.map(root => `${root}.js`)
jsroots.forEach(js => {
  gulp.task(js, generate(js))
})

gulp.task('browserify', jsroots)
