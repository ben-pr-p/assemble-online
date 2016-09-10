'use strict'

const log = require('debug')('assemble:socket:help')

module.exports.getUser = function (data, socket) {
  return data.users.get(exports.getUserId(data, socket))
}

module.exports.getUserId = function (data, socket) {
  return data.userIdFromSocketId.get(socket.id)
}

module.exports.removeUser = function (data, user, socket) {
  log('Removing all traces of %j', user)
  data.lm.removeUser(user.id)
  data.sockets.delete(user.id)
  data.users.delete(user.id)
  socket.disconnect()
}
