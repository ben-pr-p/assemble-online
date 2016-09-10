'use strict'

/**
 * Handles:
 *   'agenda/mine'
 *   'agenda/response'
 *   'agenda/request'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (data, emitAll) {
  const log = debug('assemble:' + data.room + ':agenda')

  /**
   * Define functions with access to data
   */

  function onNew (socket, args, next) {
    const item = args[1]

    /*
     * DB TODO: Session.addAgendaItem
     */

    log('Got new agenda item %j', item)
    data.agenda.push(item)
    emitAll('agenda', data.agenda)
  }

  const router = Router()

  router.on('new', onNew)

  return router
}

