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
    log(sesh)
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

  function onReorder (socket, args, next) {
    const data = args[1]
    const item = data.item
    const behind = data.behind

    const itemOrder = {
      prev: null,
      next: null
    }

    log('Got reorder request to move item %s to before %s', item, behind)

    const orderlookup = {}
    const copy = sesh.agenda.slice().map(i => {
      orderlookup[i._id] = i.order
      if (i._id == item)
        itemOrder.prev = i.order
      return {o: i.order, _id: i._id}
    })

    copy.forEach(c => {
      if (item == c._id) {
        if (typeof behind == 'string')
          c.o = orderlookup[behind] - 0.5
        else
          c.o = copy.length + 10
      }
    })

    const sortedcopy = copy.sort((a,b) => a.o - b.o)
    sortedcopy.forEach((c, idx) => {
      if (c._id == item)
        itemOrder.next = c.o
      orderlookup[c._id] = idx
    })

    let shouldBlock = false
    if (itemOrder.next <= sesh.activeAgendaItem) {
      shouldBlock = true
      log('This reorder should be blocked because item %s cannot move to before an active item')
    }

    else if (itemOrder.prev <= sesh.activeAgendaItem) {
      shouldBlock = true
      log('This reorder should be blocked because item %s cannot move after it has been activiated')
    }

    if (shouldBlock) {
      const sorted = sesh.agenda.concat().sort((a,b) => a.order - b.order)
      return emitAll('agenda', sorted)
    }

    for (let idx = 0; idx < sesh.agenda.length; idx++) {
      sesh.agenda[idx].order = orderlookup[sesh.agenda[idx]._id]
    }

    sesh.markModified('agenda')
    sesh.save(err => {
      if (err) {
        log('Found error %j', err)
        return socket.emit('error', err)
      }

      log('Successfully reordered agenda items')
      const sorted = sesh.agenda.concat().sort((a,b) => a.order - b.order)
      emitAll('agenda', sorted)
    })
  }

  function onAdvance (socket, args, next) {
    db.session.advanceAgenda(sesh._id, (err, session) => {
      if (err) {
        log('Found error %j', err)
        return socket.emit('error', err)
      }

      sesh.activeAgendaItem = session.activeAgendaItem
      log('Successfully advanced agenda to %d', session.activeAgendaItem)
      emitAll('activeAgendaItem', session.activeAgendaItem)
    })
  }

  const router = Router()

  router.on('new', onNew)
  router.on('edit', onEdit)
  router.on('reorder', onReorder)
  router.on('advance', onAdvance)

  router.on('*', help.handleUndefined('agenda'))

  return router
}
