const redis = require('../redis')
const action = require('./action')
const { distance } = require('../utils')
const panic = err => {throw err}


process.on('message', (room, uid) => {
  action(room, uid)
  .then(() => process.send('done'))
  .catch(panic)
})
