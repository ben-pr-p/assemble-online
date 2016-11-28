const gulp = require('gulp')
gulp.task('build', ['browserify', 'workers', 'styles', 'images'])
