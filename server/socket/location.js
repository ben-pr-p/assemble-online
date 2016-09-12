'use strict'

/**
 * Handles:
 *   'location/mine'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (sesh, state, emitAll) {
  const log = debug('assemble:' + sesh.room + ':location')

  /**
   * Define functions with access to data
   */

  function onDelta (socket, args, next) {
    const loc = args[1]
    const uid = help.getUserId(state, socket)
    state.lm.handleLocationUpdate(uid, loc)
  }

  const router = Router()

  router.on('delta', onDelta)
  router.on('*', help.handleUndefined('location'))

  return router
}
