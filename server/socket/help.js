'use strict'

const log = require('debug')('assemble:socket:help')
const db = require('../db-api')

module.exports.getUser = function (state, socket) {
  return state.users.get(exports.getUserId(state, socket))
}

module.exports.getUserId = function (state, socket) {
  return state.userIdFromSocketId.get(socket.id)
}

module.exports.removeUser = function (sesh, state, user, socket, fn) {
  log('Removing all traces of %j...', user)

  db.session.registerUserExit(sesh._id, user.id, (err, s) => {
    if (err) {
      log('Found error %j', err)
      return fn(err)
    }

    state.lm.removeUser(user.id)
    state.sockets.delete(user.id)
    state.users.delete(user.id)
    socket.disconnect()

    return fn(null, s)
  })
}

module.exports.handleUndefined = function (name) {
  return function (sock, args, next) {
    log('%s: got undefined event %s', name, args[0])
    log('had data %j', args[1])
    throw new Error()
    next()
  }
}

module.exports.socketEventLogger = function (name, regex) {
  return function (sock, args, next) {
    if (regex && args[0].match(regex)) {
      log('%s: got event %s', name, args[0])
      log('had data %j', args[1])
    }
    next()
  }
}
