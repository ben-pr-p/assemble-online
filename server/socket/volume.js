'use strict'

/**
 * Handles:
 *   'volume/mine'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (data) {
  const log = debug('assemble:' + data.room + ':volume')

  /**
   * Define functions with access to data
   */

  function onMine (socket, args, next) {
    const vol = args[1]
    const uid = help.getUserId(data, socket)
    data.volumes.set(uid, vol)
  }

  const router = Router()

  router.on('mine', onMine)

  return router
}
