const redis = require('../redis')

const ignore = _ => _
const panic = err => {throw err}

module.exports = (io, nsp, name) => {
  const room = redis.room(name)
  const pings = {}

  nsp.on('connection', socket => {
    socket.on('me', user => {
      room.users
        .add(socket.id, user)
        .then(room.users.getAll)
        .then(allUsers => nsp.emit('users', allUsers))
        .catch(panic)

      pings[socket.id] = 50
    })

    socket.on('location', loc => {
      room.locations
        .set(socket.id, loc)
        .then(ignore)
        .catch(panic)

      // redis.
    })

    socket.on('volume', vol =>
      room.volumes
        .set(socket.id, vol)
        .then(ignore)
        .catch(panic)
    )

    socket.on('signal', config =>
      nsp
        .connected[config.to]
        .emit('signal', config)
    )

    socket.on('disconnect', () =>
      room.users
        .remove(socket.id)
        .then(room.users.getAll)
        .then(allUsers => {
          nsp.emit('users', allUsers)

          if (Object.keys(allUsers).length == 0) {
            nsp.implode()
          }
        })
        .catch(panic)
    )
  })

  nsp.implode = () => {
    Object.keys(nsp.connected).forEach(id => nsp[id].disconnect())
    nsp.removeAllListeners()
    delete io.nsps[name]
  }

  nsp.update = () => {
    for (let uid in nsp.connected) {
      room.updates.for(uid)
      .then(update => nsp.connected[uid].emit(update))
      .catch(panic)
    }
  }

  const nextUpdateTime = () => Object.values(pings).reduce((min, curr) =>
    Math.min(min, curr)
  , 10000000)

  const updateThenTick = () =>
    setTimeout(() => {
      nsp.update()
      setTimeout(updateThenTick, nextUpdateTime())
    }, nextUpdateTime())

  return nsp
}
