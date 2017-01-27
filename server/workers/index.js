const log = require('debug')('assemble:attenuation-workers')
const child_process = require('child_process')

const children = require('os').cpus().map(_ => ({
  process: child_process.fork('./server/workers/worker'),
  free: true
}))

const queue = []

/* On a free worker process queued job if exists, otherwise mark as free */
children.forEach(c => {
  c.process.on('message', message => {
    // log('Job finished: %s', message)
    const job = queue.shift()
    if (job)
      c.process.send(job)
    else
      c.free = true
  })

  c.process.on('error', error => {
    log('Error in child process: %j', error)
  })
})

/* Get first free kid if one exists, otherwise undefined */
const getFirstFree = () => children.filter(c => c.free)[0]

/* Handle new jobs */
module.exports = ({room, uid}) => {
  const freeKid = getFirstFree()
  if (freeKid) {
    // log('There\'s a free kid')
    freeKid.free = false
    freeKid.process.send({uid, room})
  } else {
    // log('Queueing...')
    queue.push({uid, room})
  }
}
