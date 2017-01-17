const redis = require('../redis')
const { distance } = require('../utils')

const attify = dist =>
  Math.min(1 / (Math.pow(dist - 70, 2) / 5000), 1)

module.exports = ({room, uid}) => new Promise((resolve, reject) => {
  const redisRoom = redis.room(room)

  redisRoom
    .locations.getAll()
    .then(locs => {
      const others = Object.keys(locs).filter(otherid => otherid != uid)
      Promise.all(others.map(otherid => new Promise((resolve, reject) =>
        redisRoom.attenuations.set(uid, otherid, attify(distance(locs[uid], locs[otherid])))
      )))
      .then(resolve)
    })
    .catch(reject)
})
