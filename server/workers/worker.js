const workers = {
  attenuation: require('./attenuation-action'),
  checkpoint:  require('./checkpoint-action')
}

const { distance } = require('../utils')
const log = require('debug')('assemble:worker')
const panic = err => {log(err); throw err}

process.on('message', (params) => {
  Promise.all([
    workers.attenuation(params),
    workers.checkpoint(params)
  ])
  .then(() =>
    process.send('done')
  )
  .catch(panic)
})
