'use strict'

/**
 * Handles:
 *   'user/new'
 *   'user/update'
 *   'user/trash'
 */


/*
 * DB TODO: User.create
 *  then ->
 *    Session.registerUserEnter
 */

const debug = require('debug')
const Router = require('socket.io-events')
const db = require('../db-api')

const propsToTransfer = ['x', 'y', 'easyrtcid', 'color', 'badge']
const colorScale = ['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6']

module.exports = function createRouter (sesh, state, emitAll) {
  const log = debug('assemble:' + sesh.room + ':user')

  /**
   * Define functions with access to data
   */

  function onNew (socket, args, next) {
    const user = args[1]

    user.ip = socket.sock.handshake.address
    user.browser =  socket.sock.request.headers['user-agent']
    user._id = user.id

    user.color = colorScale[state.colorIdx]
    state.colorIdx = (state.colorIdx + 1) % colorScale.length

    log('Got new user %s', user.id)
    log('Assigned %s color %s', user.id, user.color)

    let shouldStartUpdates = (state.users.size == 0)

    db.user.ensure(user, (err, u) => {
      if (err) {
        log('Found error %j', err)
        return socket.emit('error', err)
      }

      db.session.registerUserEnter(sesh._id, u._id, (err, s) => {
        if (err) {
          log('Found error %j', err)
          return socket.emit('error', err)
        }

        state.users.set(user.id, user)
        state.sockets.set(user.id, socket)
        state.userIdFromSocketId.set(socket.id, user.id)
        state.lm.handleLocationUpdate(user.id, {x: 0, y: 0})

        emitAll('users', [...state.users])
        emitAll('dimensions', state.dimensions)
        emitAll('locations', state.lm.getLocations())

        if (shouldStartUpdates) {
          state.modifyUpdates()
        }

      })
    })

    /*
     * Do I need to keep this?
     */
    socket.emit('done')
  }

  function onUpdate (socket, args, next) {
    const user = args[1]

    log('Got existing user %s update', user.id)
    let existing = state.users.get(user.id)

    propsToTransfer.forEach(prop => {
      if (existing[prop] && !user[prop])
        user[prop] = existing[prop]
    })

    state.users.set(user.id, user)

    log('Serving users %j', [...state.users])
    emitAll('users', [...state.users])

    /*
     * Do I need to keep this?
     */
    socket.emit('done')
  }

  function onTrash (socket, args, next) {
    const user = help.getUser(state, socket)
    if (!user) {
      log('Unknown user requesting trashing')
    } else {
      log('User %j requested trashing', user)
      help.removeUser(sesh, state, user, socket, (err, s) => {
        log('User %s trashed from session %s', user.id, s.id)
      })
    }
  }
  const router = Router()

  router.on('/new', onNew)
  router.on('/update', onUpdate)
  router.on('/trash', onTrash)

  return router
}

