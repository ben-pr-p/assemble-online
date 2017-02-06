const gulp = require('gulp')
const babelify = require('babelify')
const bro = require('gulp-bro')
const uglify = require('gulp-uglify')
const empty = require('gulp-empty')
const vfs = require('vinyl-fs')
const clientapps = require('./client-apps')

const dest = './build'

const shouldUglify = process.env.NODE_ENV == 'production'

const generate = jsname => () =>
  vfs.src(`./client/${jsname}`)
    .pipe(bro({
      transform: [babelify],
      extensions: ['.js','.jsx']
    }))
    .pipe((shouldUglify ? uglify : empty)())
    .pipe(gulp.dest(dest))

const jsroots = clientapps.map(root => `${root}.js`)
jsroots.forEach(js => {
  gulp.task(js, generate(js))
})

gulp.task('browserify', jsroots)
