const log = require('debug')('assemble:attenuation-workers')
const cluster = require('cluster')
const kue = require('kue')
const queue = kue.createQueue({
  redis: process.env.REDIS_URL
})

const clusterWorkerSize = process.env.NUM_WORKERS || require('os').cpus().length

const action = {
  setAttenuations: require('./set-attenuations'),
  joinCheckpoints:  require('./user-checkpoints'),
  checkMembers: require('./check-members')
}

if (cluster.isMaster) {
  log('Worker booted up, ready to recieve jobs')
  for (let i = 0; i < clusterWorkerSize; i++) {
    cluster.fork()
  }
} else {
  queue.process('location-change', 10, (job, done) => {
    Promise.all([
      action.setAttenuations(job.data, queue),
      action.joinCheckpoints(job.data, queue)
    ])
    .then(() => done())
    .catch(done)
  })

  queue.process('checkpoint-change', 10, (job, done) => {
    action.checkMembers(job.data, queue)
    .then(() => done())
    .catch(err => {
      log('Found error')
      log(err)
      done(err)
    })
  })
}
