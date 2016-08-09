var gulp = require('gulp')
gulp.task('build', ['jade', 'browserify', 'workers', 'styles', 'images', 'fonts'])
