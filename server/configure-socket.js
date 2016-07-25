var log = require('debug')('assemble:socket')

var users = []
var sockets = {}
var dimensions = {}

module.exports = function (io) {
  io.on('connection', function (socket) {

    socket.on('connect', function () {
      log('New connection, sending users')
      socket.emit('users', users)
    })

    socket.on('newuser', function (user) {
      var existing = users.filter(u => u.id == user.id)[0]
      if (existing) {
        log('Got existing user %s update', user.id)
        users.splice(users.indexOf(existing), 1)

        user.x = existing.x
        user.y = existing.y

        users.push(user)
        return socket.emit('users', users)
      }

      log('Got new user %s', user.id)

      users.push(user)
      sockets[user.id] = socket

      socket.emit('users', users)
    })

    socket.on('movement', function(user) {
      var moved = users.filter(u => u.id == user.id)[0]
      moved.x = user.x
      moved.y = user.y

      setDimensions(users)

      socket.emit('movement-update', {users, dimensions})
    })

    socket.on('disconnect', function () {
      var user = users.filter(u => sockets[u.id] == socket)[0]
      if (!user) {
        log('Unknown user disconnect')
      } else {
        log('User %s disconnected', user.id)
        users.splice(users.indexOf(user), 1)
      }
    })
  })

  function sendUpdates () {
    users.forEach(u => {
      if (sockets[u.id]) {
        sockets[u.id].emit('users', users)
      }
    })
    log('Sent updates to %d users', users.length)
  }

  function setDimensions (users) {
    var maxPosX = maxPosY = maxScreenX = maxScreenY = 0

    users.forEach(u => {
      if (u.x > maxPosX) maxPosX = u.x
      if (u.y > maxPosY) maxPosY = u.y
      if (u.screenSize.x > maxScreenX) maxScreenX = u.screenSize.x
      if (u.screenSize.y > maxScreenY) maxScreenY = u.screenSize.y
    })

    dimensions = {
      x: Math.max(maxScreenX, maxPosX + (maxScreenX / 2)),
      y: Math.max(maxScreenY, maxPosY + (maxScreenY / 2))
    }
  }
}
