const redis = require('../redis')
const queueWorkers = require('../workers')
const colors = require('./user-colors')
const {print} = require('../utils')
const debug = require('debug')
const crypto = require('crypto')

let colorIdx = 0

const transformId = raw =>
  raw.split('#')[1]

const ignore = _ => _
const panic = err => {
  throw print(err)
}

const hashObj = obj => crypto
  .createHash('md5')
  .update(JSON.stringify(obj))
  .digest('hex')

module.exports = (io, nsp, name) => {
  const room = redis.room(name)
  const pings = {}
  const log = debug('assemble:' + name)
  let updateIntervalId = null

  log('Binding events')

  nsp.on('connection', socket => {
    log('New connection')

    const uid = transformId(socket.id)

    socket.on('me', user => {
      room.users
        .add(uid, Object.assign(user, {
          id: uid,
          color: colors[colorIdx % colors.length]
        }))
        .then(room.users.getAll)
        .then(allUsers => {
          log('Have users %j', allUsers)
          if (allUsers.length > 0 && !updateIntervalId)
            updateIntervalId = setInterval(nsp.update, 50)

          nsp.emit('users', allUsers)
          nsp.emit('dimensions', [
            400 * allUsers.length,
            300 * allUsers.length
          ])

          room.locations.set(uid, [
            200 * allUsers.length,
            150 * allUsers.length
          ])
          .then(rez => queueWorkers({room: name, uid: uid}))
          .catch(panic)
        })
        .catch(panic)

      colorIdx++
      pings[uid] = 50
    })

    socket.on('location', loc => {
      room.locations
        .set(uid, loc)
        .then(ignore)
        .catch(panic)

      queueWorkers({room: name, uid: uid})
    })

    socket.on('volume', vol =>
      room.volumes
        .set(uid, vol)
        .then(ignore)
        .catch(panic)
    )

    socket.on('checkpoint-new', checkpoint =>
      room.checkpoints
        .add(hashObj(checkpoint), checkpoint)
        .then(() =>
          room.checkpoints
            .getAll()
            .then(all => {
              log('Requested add checkpoint %j', checkpoint)
              log('Have checkpoints %j', all)
              nsp.emit('checkpoints', all)
            })
            .catch(panic)
        )
        .catch(panic)
    )

    socket.on('checkpoint-edit', checkpoint =>
      room.checkpoints
        .set(checkpoint.id, checkpoint)
        .then(() =>
          room.checkpoints
            .getAll()
            .then(all => {
              log('Have checkpoints %j', all)
              nsp.emit('checkpoints', all)
            })
            .catch(panic)
        )
        .catch(panic)
    )

    socket.on('checkpoint-destroy', checkpoint =>
      room.checkpoints
        .remove(checkpoint.id)
        .then(() =>
          room.checkpoints
            .getAll()
            .then(all => {
              log('Have checkpoints %j', all)
              nsp.emit('checkpoints', all)
            })
            .catch(panic)
        )
        .catch(panic)
    )

    socket.on('signal', config => {
      const fromUid = uid
      const sid = `/${name}#${config.to}`

      if (nsp.connected[sid]) {
        nsp
          .connected[sid]
          .emit(`signal-from-${fromUid}`, config.data)
      }
    })

    socket.on('disconnect', () => {
      pings[uid] = undefined
      delete pings[uid]

      room.users
        .remove(uid)
        .then(_ =>
          room.users
            .getAll()
            .then(allUsers => {
              nsp.emit('users', allUsers)

              log('After disconnect have users %j', allUsers)

              if (allUsers.length == 0) {
                setTimeout(() => {
                  room.users.size()
                  .then(num => {
                    if (num == 0) {
                      log('Imploding...')
                      nsp.implode()
                      clearInterval(updateIntervalId)
                    }
                  })
                  .catch(panic)
                }, 200)
              }

              nsp.emit('dimensions', [
                400 * allUsers.length,
                300 * allUsers.length
              ])
            })
            .catch(panic)
        )
        .catch(panic)
    })
  })

  nsp.implode = () => {
    Object.keys(nsp.connected).forEach(id => nsp[id].disconnect())
    nsp.removeAllListeners()
    delete io.nsps['/' + name]
  }

  nsp.update = () => {
    for (let sid in nsp.connected) {
      room.updates.for(transformId(sid))
      .then(update => {

        /* Could not be connected if stuff has changed since 5 lines ago */
        if (nsp.connected[sid]) {
          nsp.connected[sid].emit('update', update)
        }

      })
      .catch(panic)
    }
  }

  return nsp
}
