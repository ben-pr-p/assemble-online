const redis = require('../redis')
const log = require('debug')('assemble:checkpoint-action')
const { distance, filterobj } = require('../utils')
const panic = err => {throw err}

const CHECKPOINT_JOIN_DISTANCE = 700

module.exports = ({room, uid}) => new Promise((resolve, reject) => {
  const redisRoom = redis.room(room)

  Promise.all([
    redisRoom.checkpoints.getAll(),
    redisRoom.locations.get([uid])
  ])
  .then(([checks, loc]) => {
    const beforeIn = filterobj(checks, c => c.members.includes(uid))
    const nowIn = filterobj(checks, c => distance(loc, c.loc) < CHECKPOINT_JOIN_DISTANCE)

    const toLeave = Object.keys(beforeIn).filter(cid => !nowIn[cid])
    const toJoin = Object.keys(nowIn).filter(cid => !beforeIn[cid])

    const me = redisRoom.checkpoints.user(uid)

    Promise.all(
      toLeave.map(me.leave).concat(
      toJoin.map(me.join)
    ))
    .then(resolve)
    .catch(reject)
  })
})
