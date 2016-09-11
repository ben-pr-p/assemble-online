'use strict'

const log = require('debug')('assemble:socket:help')

module.exports.getUser = function (state, socket) {
  return state.users.get(exports.getUserId(state, socket))
}

module.exports.getUserId = function (state, socket) {
  return state.userIdFromSocketId.get(socket.id)
}

module.exports.removeUser = function (state, user, socket) {
  log('Removing all traces of %j', user)
  state.lm.removeUser(user.id)
  state.sockets.delete(user.id)
  state.users.delete(user.id)
  socket.disconnect()
}
