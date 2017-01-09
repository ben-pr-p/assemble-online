const gulp = require('gulp')
const babelify = require('babelify')
const bro = require('gulp-bro')
const uglify = require('gulp-uglify')
const empty = require('gulp-empty')
const rollupify = require('rollupify')
const vfs = require('vinyl-fs')
const clientapps = require('./client-apps')

const dest = './build'

const shouldUglify = process.env.NODE_ENV == 'production'
console.log(shouldUglify)

const generate = jsname => () =>
  vfs.src(`./client/${jsname}`)
    .pipe(bro({
      transform: [babelify],
      extensions: ['.js','.jsx'],
      fullPaths: true
    }))
    .pipe((shouldUglify ? uglify : empty)())
    .pipe(gulp.dest(dest))

const jsroots = clientapps.map(root => `${root}.js`)
jsroots.forEach(js => {
  gulp.task(js, generate(js))
})

gulp.task('browserify', jsroots)
