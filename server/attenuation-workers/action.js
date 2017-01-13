const redis = require('../redis')
const { distance } = require('../utils')

module.exports = ({room, uid}) => new Promise((resolve, reject) => {
  const redisRoom = redis.room(room)

  redisRoom
    .locations.getAll()
    .then(locs => {
      const others = Object.keys(locs).filter(otherid => otherid != uid)
      Promise.all(others.map(otherid => new Promise((resolve, reject) =>
        redisRoom.attenuations.set(uid, otherid, distance(locs[uid], locs[otherid]))
      )))
      .then(resolve)
    })
    .catch(reject)
})
