var log = require('debug')('assemble:socket')

var UPDATE_INTERVAL = 100
var BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
var USERS_PER_SCREEN = 4

var mainIo = null

var users = {}
var locations = {}
var volumes = {}
var distances = {}
var sockets = {}
var userIdFromSocketId = {}

var dimGrowth = 1
var dimensions = Object.assign({}, BASE_DIMENSIONS)

/**
 * HELPERS
 */

function getUser (socket) {
  return users[getUserId(socket)]
}

function getUserId (socket) {
  return userIdFromSocketId[socket.id]
}

function removeUser (user, socket) {
  delete sockets[user.id]
  delete locations[user.id]
  delete users[user.id]
}

/**
 * MANAGING REGULAR UPDATING
 */
var updateIntervalId = null

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

function sendUpdates () {
  mainIo.emit('locations', locations)
  mainIo.emit('volumes', volumes)
}

/**
 * MANAGE DIMENSIONS
 */
function setDimensions (n) {
  var newDimGrowth = (n > 0) ? Math.ceil(n / 4) : 1
  if (newDimGrowth == dimGrowth) {
    return false
  } else {
    dimGrowth = newDimGrowth
    dimensions = {
      x: BASE_DIMENSIONS.x * dimGrowth,
      y: BASE_DIMENSIONS.y * dimGrowth
    }
    return true
  }
}

exports.configure = function (io) {
  mainIo = io

  io.on('connection', function (socket) {

    socket.on('connect', function () {
      log('New connection, sending users')
      io.emit('users', users)
      io.emit('dimensions', dimensions)
      io.emit('locations', locations)
      io.emit('volumes', volumes)
    })

    /*
     * Handle new user
     */
    socket.on('me', function (user) {
      var numUsers = Object.keys(users).length
      var firstUser = numUsers == 0

      var existing = users[user.id]
      if (existing) {
        log('Got existing user %s update', user.id)

        user.x = existing.x
        user.y = existing.y

        users[user.id] = user
        return io.emit('users', users)
      }

      log('Got new user %s', user.id)

      users[user.id] = user
      sockets[user.id] = socket
      userIdFromSocketId[socket.id] = user.id
      locations[user.id] = {x: 0, y: 0}

      io.emit('users', users)
      io.emit('dimensions', dimensions)
      io.emit('locations', locations)
      if (firstUser) startUpdates()
    })

    /*
     * Handle user movement
     */
    socket.on('my-location', function (loc) {
      var uid = getUserId(socket)
      locations[uid] = loc
    })

    /**
     * Handle user volume broadcast
     */
    socket.on('my-volume', function (data) {
      var uid = getUserId(socket)
      volumes[uid] = data
    })

    socket.on('my-announcement', function (data) {
      io.emit('announcement', data)
    })

    /*
     * Handle user disconnect
     */
    socket.on('disconnect', function () {
      var user = getUser(socket)
      if (!user) {
        log('Unknown user disconnect')
      } else {
        log('User %s disconnected', user.id)
        removeUser(user, socket)
      }

      /*
       * Stop sending updates
       */
      if (Object.keys(users).length == 0) {
        log('No users left - cancelling updates')
        stopUpdates()
      }
    })
  })
}
