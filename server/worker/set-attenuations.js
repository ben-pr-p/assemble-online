const redis = require('../redis')
const log = require('debug')('assemble:set-attenuations')
const { distance } = require('../utils')
const panic = err => {throw err}

const attify = dist =>
  Math.min(1 / (Math.pow(dist - 70, 2) / 5000), 1)

module.exports = ({ room, uid }, queue) => new Promise((resolve, reject) => {
  const redisRoom = redis.room(room)

  redisRoom
    .locations.getAll()
    .then(locs => {
      const others = Object.keys(locs).filter(otherid => otherid != uid)
      Promise.all(others.map(otherid =>
        redisRoom.attenuations.set(uid, otherid, attify(distance(locs[uid], locs[otherid])))
      ))
      .then(resolve)
      .catch(reject)
    })
    .catch(reject)
})
