'use strict'

/**
 * Handles:
 *   'announcement/mine'
 *   'announcement/response'
 *   'announcement/request'
 */

const debug = require('debug')
const Router = require('socket.io-events')
const help = require('./help')

module.exports = function createRouter (data, emitAll) {
  const log = debug('assemble:' + data.room + ':announcement')

  /**
   * Define functions with access to data
   */

  function onMine (socket, args, next) {
    const ann = args[1]

    /*
     * DB TODO: Session.addAnnouncement
     * Also, this whole thing should be rewritten
     */

    const clone = {}
    const byUser = {}

    for (let type in ann.responses) {
      clone[type] = [] // for 19j

      ann.responses[type].forEach(response => {
        if (!byUser[response.user]) {
          byUser[response.user] = []
        }
        byUser[response.user].push({response, type})
      })
    }

    for (let uid in byUser) {
      let tokeep = null
      if (byUser[uid].length > 1)
        tokeep = byUser[uid].sort((a, b) => b.response.date - a.response.date)[0]
      else if (byUser[uid].length == 1)
        tokeep = byUser[uid][0]

      if (tokeep)
        clone[tokeep.type].push(tokeep.response)
    }

    data.announcement = ann
    data.announcement.responses = clone
    emitAll('announcement', data.announcement)
  }

  function onResponse (socket, args, next) {
    const me = help.getUser(data, socket)
    const {type, reason, date} = args[1]
    const user = me.id
    const userAvatar = me.avatar
    const userName = me.name

    let existingUserResponse, existingResponseIdx
    for (let type in data.announcement.responses) {
      data.announcement.responses[type].forEach((r, idx) => {
        if (r.user == user) {
          existingUserResponse = r
          existingResponseIdx = idx
        }
      })
    }

    if (existingUserResponse) {
      log('Erasing response of type %s for user %s', existingUserResponse.type, existingUserResponse.user)
      data.announcement.responses[existingUserResponse.type].splice(existingResponseIdx, 1)
    }

    const result = {user, type, reason, date, userAvatar, userName}
    log('Adding response %j', result)
    data.announcement.responses[type].push(result)

    emitAll('announcement', data.announcement)
  }

  function onRequest (socket, args, next) {
    log('User %s requested announcement: %j', help.getUserId(data, socket), data.announcement)
    emitAll('announcement', data.announcement)
  }

  const router = Router()

  router.on('mine', onMine)
  router.on('response', onResponse)
  router.on('request', onRequest)

  return router
}
