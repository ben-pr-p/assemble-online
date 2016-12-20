'use strict'

/**
 * Handles:
 *   'user/new'
 *   'user/update'
 *   'user/trash'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

const propsToTransfer = ['x', 'y', 'easyrtcid', 'color', 'badge']
// const rachelScale = ['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6']

const retroScale = [
  '#2ecc71', '#f1c40f', '#f39c12', '#9b59b6', '#16a085',
  '#2980b9', '#d35400', '#e74c3c', '#8e44ad', '#1abc9c',
  '#27ae60', '#3498db', '#e67e22', '#c0392b'
]

const colorScale = retroScale

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

    log('Got new user %s: %j', user.id, user)
    log('Assigned %s color %s', user.id, user.color)

    let shouldStartUpdates = (state.users.size == 0)

    state.users.set(user.id, user)
    state.sockets.set(user.id, socket)
    state.userIdFromSocketId.set(socket.id, user.id)
    state.lm.handleLocationUpdate(user.id, {x: 0, y: 0})

    log([...state.users])
    emitAll('users', [...state.users])
    emitAll('dimensions', state.dimensions)
    emitAll('locations', state.lm.getLocations())

    if (shouldStartUpdates) {
      state.modifyUpdates()
    }
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
  }

  function onTrash (socket, args, next) {
    const user = help.getUser(state, socket)
    if (!user) {
      log('Unknown user requesting trashing')
    } else {
      log('User %j requested trashing', user)
      help.removeUser(sesh, state, user, socket)
      log('User %s trashed from session %s', user.id, sesh.id)
    }
  }

  const router = Router()

  router.on('/new', onNew)
  router.on('/update', onUpdate)
  router.on('/trash', onTrash)

  router.on('*', help.handleUndefined('user'))

  return router
}
