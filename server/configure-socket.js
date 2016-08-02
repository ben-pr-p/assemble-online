var log = require('debug')('assemble:socket')

var UPDATE_INTERVAL = 100
var BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
var USERS_PER_SCREEN = 4

var users = []
var sockets = {}
var dimGrowth = 1
var dimensions = Object.assign({}, BASE_DIMENSIONS)
var updateIntervalId = null

function sendUpdates () {
  users.forEach(u => {
    if (sockets[u.id]) {
      sockets[u.id].emit('movement-update', {users, dimensions})
    }
  })
}

function setDimensions (users) {
  dimGrowth = (users.length > 0) ? Math.ceil(users.length / 4) : 1

  dimensions = {
    x: BASE_DIMENSIONS.x * dimGrowth,
    y: BASE_DIMENSIONS.y * dimGrowth
  }
}

function startUpdates () {
  if (!updateIntervalId) {
    updateIntervalId = setInterval(sendUpdates, UPDATE_INTERVAL)
  }
}

function stopUpdates () {
  clearInterval(updateIntervalId)
  updateIntervalId = null
}

function areUpdatesRunning () {
  return !!updateIntervalId
}

exports.configure = function (io) {
  io.on('connection', function (socket) {

    socket.on('connect', function () {
      log('New connection, sending users')
      socket.emit('users', users)
    })

    /*
     * Handle new user
     */
    socket.on('newuser', function (user) {
      var firstUser = users.length == 0

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

      if (firstUser) startUpdates()
    })

    /*
     * Handle user movement
     */
    socket.on('movement', function (user) {
      var moved = users.filter(u => u.id == user.id)[0]
      moved.x = user.x
      moved.y = user.y

      setDimensions(users)
    })

    /**
     * Handle user volume broadcast
     */
    socket.on('my-volume', function (data) {
      var user = users.filter(u => u.id == data.userId)[0]
      if (user)
        user.volume = data.rms
    })

    /*
     * Handle user disconnect
     */
    socket.on('disconnect', function () {
      var user = users.filter(u => sockets[u.id] == socket)[0]
      if (!user) {
        log('Unknown user disconnect')
      } else {
        log('User %s disconnected', user.id)
        users.splice(users.indexOf(user), 1)
      }

      /*
       * Stop sending updates
       */
      if (users.length == 0) {
        log('No users left - cancelling updates')
        stopUpdates()
      }
    })
  })
}
