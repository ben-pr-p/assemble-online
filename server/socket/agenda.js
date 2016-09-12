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
const db = require('../db-api')

module.exports = function createRouter (sesh, state, emitAll) {
  const log = debug('assemble:' + sesh.room + ':agenda')

  /**
   * Define functions with access to data
   */

  function onNew (socket, args, next) {
    const item = args[1]

    log('Got new agenda item %j', item)
    item.order = sesh.agenda.length
    sesh.agenda.push(item)

    sesh.save(err => {
      if (err) {
        log('Found error %j', err)
        return socket.emit('error', err)
      }

      log('Successfully added agenda item %j to session %s', item, sesh._id)
      const sorted = sesh.agenda.concat().sort((a,b) => a.order - b.order)
      emitAll('agenda', sorted)
    })
  }

  function onEdit (socket, args, next) {
    const item = args[1]

    log('Got agenda item edit %s', item._id)
    let existingIdx = null
    sesh.agenda.forEach((ag, idx) => {
      if (ag._id == item._id)
        existingIdx = idx
    })

    if (existingIdx != null) {
      for (let prop in item) {
        if (prop != '_id')
          sesh.agenda[existingIdx][prop] = item[prop]
      }
    }

    sesh.markModified('agenda')
    sesh.save(err => {
      if (err) {
        log('Found error %j', err)
        return socket.emit('error', err)
      }

      log('Successfully edited agenda item %s of session %s', item._id, sesh._id)
      const sorted = sesh.agenda.concat().sort((a,b) => a.order - b.order)
      emitAll('agenda', sorted)
    })
  }

  const router = Router()

  router.on('new', onNew)
  router.on('edit', onEdit)
  router.on('*', help.handleUndefined('agenda'))

  return router
}

