module.exports = (room, uid) => new Promise((resolve, reject) => {
  const room = redis.room(room)

  room
    .locations.getAll()
    .then(locs => {
      const others = Object.keys(locs).filter(otherid => otherid != uid)
      Promise.all(others.map(otherid => new Promise((resolve, reject) =>
        room.attenuations.set(uid, otherid, distance(locs[uid], locs[otherid]))
      )))
      .then(resolve)
    })
    .catch(reject)
})
