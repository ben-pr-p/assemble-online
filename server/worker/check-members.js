const redis = require('../redis')
const log = require('debug')('assemble:check-members')
const { CHECKPOINT_JOIN_DISTANCE } = require('./consts')
const { distance, filterobj } = require('../utils')
const panic = err => {throw err}

module.exports = ({room, cid}, queue) => new Promise((resolve, reject) => {
  const redisRoom = redis.room(room)

  Promise.all([
    redisRoom.checkpoints.get(cid),
    redisRoom.locations.getAll()
  ])
  .then(([check, locs]) => {
    const oldMembers = check.members
    const newMembers = Object.keys(locs)
      .filter(uid => distance(check.loc, locs[uid]) < CHECKPOINT_JOIN_DISTANCE)

    if (newMembers.length == oldMembers.length && (oldMembers.filter(m => !newMembers.includes(m)).length == 0 )) {
      log('No new members')
      return resolve(null)
    }

    log('Have new members')
    log(newMembers)
    redisRoom.checkpoints.setMembers(cid, newMembers)
    .then(_ => {
      log(_)
      redisRoom.checkpoints.getAll()
      .then(data => {
        log(data)
        queue.create('update', {event: 'checkpoints', data}).save()
        resolve(null)
      })
      .catch(reject)
    })
    .catch(reject)
  })
  .catch(reject)
})
