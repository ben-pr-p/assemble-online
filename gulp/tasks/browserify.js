const gulp = require('gulp')
const babelify = require('babelify')
const bro = require('gulp-bro')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')
const clientapps = require('./client-apps')

const dest = './build'

const shouldUglify = process.env.ENV == 'production'

const generate = (jsname) =>
  () => vfs.src(`./client/${jsname}`)
    .pipe(bro({
      transform: babelify,
      extensions: ['.js','.jsx'],
      // debug: true
    }))
    .pipe(gulp.dest(dest))

const jsroots = clientapps.map(root => `${root}.js`)
jsroots.forEach(js => {
  gulp.task(js, generate(js))
})

gulp.task('browserify', jsroots)
