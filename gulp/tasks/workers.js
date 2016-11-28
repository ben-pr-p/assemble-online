const gulp = require('gulp')
const uglify = require('gulp-uglify')
const babelify = require('babelify')
const bro = require('gulp-bro')
const vfs = require('vinyl-fs')

const dest = './build/workers'

gulp.task('workers', () => {
  return vfs.src('./client/workers/foreman.js')
    .pipe(bro({transform: babelify}))
    .pipe(gulp.dest(dest))
})
