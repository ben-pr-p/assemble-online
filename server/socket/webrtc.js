'use strict'

/**
 * Handles:
 *   'webrtc/config'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (sesh, state, emitAll) {
  const log = debug('assemble:' + sesh.room + ':webrtc')

  /**
   * Define functions with access to data
   */

  const router = Router()

  router.on('/config', (socket, args, next) => {
    const config = args[1]
    state.sockets.get(config.to).emit('webrtc-config', config)
  })

  router.on('*', help.handleUndefined('user'))

  return router
}
