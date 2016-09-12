'use strict'

/**
 * Handles:
 *   'volume/mine'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (sesh, state, emitAll) {
  const log = debug('assemble:' + sesh.room + ':volume')

  /**
   * Define functions with access to data
   */

  function onMine (socket, args, next) {
    const vol = args[1]
    const uid = help.getUserId(state, socket)
    state.volumes.set(uid, vol)
  }

  const router = Router()

  router.on('mine', onMine)
  router.on('*', help.handleUndefined('volume'))

  return router
}
