const log = require('debug')('assemble:attenuation-workers')
const cluster = require('cluster')
const kue = require('kue')
const queue = kue.createQueue({
  redis: process.env.REDIS_URL
})

const clusterWorkerSize = require('os').cpus().length;

const action = {
  attenuation: require('./attenuation-action'),
  checkpoint:  require('./checkpoint-action')
}

if (cluster.isMaster) {
  kue.app.listen(8080)
  for (let i = 0; i < clusterWorkerSize; i++) {
    cluster.fork()
  }
} else {
  queue.process('location-change', 10, (job, done) => {
    Promise.all([
      action.checkpoint(job.data, queue),
      action.attenuation(job.data, queue)
    ])
    .then(() => done())
    .catch(done)
  })
}
