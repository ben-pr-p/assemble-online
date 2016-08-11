'use strict'

const log = require('debug')('assemble:socket')
const LocationManager = require('./helpers/location-manager')

const UPDATE_INTERVAL = 100
const BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
const USERS_PER_SCREEN = 4

let mainIo = null

let users = new Map()
let volumes = new Map()
let announcement = null
let sockets = new Map()
let userIdFromSocketId = new Map()

let dimGrowth = 1
let dimensions = Object.assign({}, BASE_DIMENSIONS)

/**
 * HELPERS
 */

function getUser (socket) {
  return users.get(getUserId(socket))
}

function getUserId (socket) {
  return userIdFromSocketId.get(socket.id)
}

function removeUser (user, socket) {
  log('Removing all traces of %j', user)
  LocationManager.removeUser(user.id)
  sockets.delete(user.id)
  users.delete(user.id)
}

/**
 * MANAGING REGULAR UPDATING
 */

function emitTo (uid, event, data) {
  mainIo.to(sockets.get(uid).id).emit(event, data)
}

let updateIntervalId = null

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
  mainIo.emit('locations', LocationManager.getLocations())
  mainIo.emit('volumes', [...volumes])
  sockets.forEach((socket, uid) => {
    mainIo.to(socket.id).emit('distances', LocationManager.distancesFor(uid))
  })
}

/**
 * MANAGE DIMENSIONS
 */
function setDimensions (n) {
  let newDimGrowth = (n > 0) ? Math.ceil(n / 4) : 1
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
      io.emit('users', [...users])
      io.emit('dimensions', dimensions)
      io.emit('locations', LocationManager.getLocations())
      io.emit('volumes', [...volumes])
    })

    /**
     * Handle new user
     */
    socket.on('me', function (user) {
      let firstUser = users.size == 0

      if (users.has(user.id)) {
        log('Got existing user %s update', user.id)

        let existing = users.get(user.id)
        user.x = existing.x
        user.y = existing.y

        users.set(user.id, user)
        return io.emit('users', [...users])
      }

      log('Got new user %s', user.id)
      users.set(user.id, user)
      sockets.set(user.id, socket)
      userIdFromSocketId.set(socket.id, user.id)
      LocationManager.handleLocationUpdate(user.id, {x: 0, y: 0})

      io.emit('users', [...users])
      io.emit('dimensions', dimensions)
      io.emit('locations', LocationManager.getLocations())
      if (firstUser) startUpdates()
    })

    /**
     * Handle user deleting themselves
     */
    socket.on('trash-me', function () {
      let user = getUser(socket)
      if (!user) {
        log('Unknown user requesting trashing')
      } else {
        log('User %j requested trashing', user)
        removeUser(user, socket)
      }
    })

    /**
     * Handle user movement
     */
    socket.on('my-location', function (loc) {
      let uid = getUserId(socket)
      LocationManager.handleLocationUpdate(uid, loc)
    })

    /**
     * Handle user volume broadcast
     */
    socket.on('my-volume', function (data) {
      let uid = getUserId(socket)
      volumes.set(uid, data)
    })

    /**
     * Handle user announcement broadcast
     */
    socket.on('my-announcement', function (data) {
      announcement = data
      io.emit('announcement', announcement)
    })

    /**
     * Emit announcement on request
     */
    socket.on('request-announcement', function (data) {
      log('User %s requested announcement', getUserId(socket))
      io.emit('announcement', announcement)
    })

    /**
     * Handle user disconnect
     */
    socket.on('disconnect', function () {
      let user = getUser(socket)
      if (!user) {
        log('Unknown user disconnect')
      } else {
        log('User %s disconnected', user.id)
        removeUser(user, socket)
      }

      /**
       * Stop sending updates
       */
      if (users.size == 0) {
        log('No users left - cancelling updates')
        stopUpdates()
      } else {
        io.emit('users', [...users])
      }
    })
  })
}
