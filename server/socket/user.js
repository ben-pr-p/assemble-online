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

const propsToTransfer = ['x', 'y', 'easyrtcid', 'color', 'badge']
const colorScale = ['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6']

module.exports = function createRouter (data, emitAll) {
  const log = debug('assemble:' + data.room + ':user')

  /**
   * Define functions with access to data
   */

  function onNew (socket, args, next) {
    const user = args[1]

    user.color = colorScale[data.colorIdx]
    data.colorIdx = (data.colorIdx + 1) % colorScale.length

    log('Got new user %s', user.id)
    log('Assigned %s color %s', user.id, user.color)

    let shouldStartUpdates = (data.users.size == 0)

    data.users.set(user.id, user)
    data.sockets.set(user.id, socket)
    data.userIdFromSocketId.set(socket.id, user.id)
    data.lm.handleLocationUpdate(user.id, {x: 0, y: 0})

    emitAll('users', [...data.users])
    emitAll('dimensions', data.dimensions)
    emitAll('locations', data.lm.getLocations())

    if (shouldStartUpdates) {
      data.modifyUpdates()
    }

    /*
     * Do I need to keep this?
     */
    socket.emit('done')
  }

  function onUpdate (socket, args, next) {
    const user = args[1]

    log('Got existing user %s update', user.id)
    let existing = data.users.get(user.id)

    propsToTransfer.forEach(prop => {
      if (existing[prop] && !user[prop])
        user[prop] = existing[prop]
    })

    data.users.set(user.id, user)

    log('Serving users %j', [...data.users])
    emitAll('users', [...data.users])

    /*
     * Do I need to keep this?
     */
    socket.emit('done')
  }

  function onTrash (socket, args, next) {
    const user = help.getUser(data, socket)
    if (!user) {
      log('Unknown user requesting trashing')
    } else {
      log('User %j requested trashing', user)
      help.removeUser(data, user, socket)
    }
  }
  const router = Router()

  router.on('/new', onNew)
  router.on('/update', onUpdate)
  router.on('/trash', onTrash)

  return router
}
