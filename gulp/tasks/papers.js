const gulp = require('gulp')
const exec = require('exec')

const papers = ['proposal']

const build = p =>
  new Promise((resolve, reject) =>
    exec(
      `texi2pdf ./papers/${p}/${p}.tex -o ./build/papers/${p}.pdf`,
      (err, out, code) => (err ? reject(err) : resolve(out))
    )
  )

gulp.task('papers', done =>
  exec('mkdir -p ./build/papers', (err, out, code) =>
    Promise.all(papers.map(build)).then(() =>
      exec('rm proposal.aux proposal.log', (err, out, code) => done())
    )
  )
)
