'use strict'

const log = require('debug')('assemble:socket')
const LocationManager = require('./helpers/distance')

const UPDATE_INTERVAL = 100
const BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
const USERS_PER_SCREEN = 4

let mainIo = null

let users = {}
let locations = {}
let volumes = {}
let sockets = new Map()
let userIdFromSocketId = {}

let dimGrowth = 1
let dimensions = Object.assign({}, BASE_DIMENSIONS)

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
  sockets.delete(user.id)
  locations[user.id] = null
  users[user.id] = null
}

/**
 * MANAGING REGULAR UPDATING
 */
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
  mainIo.emit('locations', locations)
  mainIo.emit('volumes', volumes)
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
      io.emit('users', users)
      io.emit('dimensions', dimensions)
      io.emit('locations', locations)
      io.emit('volumes', volumes)
    })

    /**
     * Handle new user
     */
    socket.on('me', function (user) {
      let numUsers = Object.keys(users).length
      let firstUser = numUsers == 0

      let existing = users[user.id]
      if (existing) {
        log('Got existing user %s update', user.id)

        user.x = existing.x
        user.y = existing.y

        users[user.id] = user
        return io.emit('users', users)
      }

      log('Got new user %s', user.id)

      users[user.id] = user
      sockets.set(user.id, socket)
      userIdFromSocketId[socket.id] = user.id
      locations[user.id] = {x: 0, y: 0}

      io.emit('users', users)
      io.emit('dimensions', dimensions)
      io.emit('locations', locations)
      if (firstUser) startUpdates()
    })

    /**
     * Handle user movement
     */
    socket.on('my-location', function (loc) {
      let uid = getUserId(socket)
      locations[uid] = loc
      LocationManager.handleLocationUpdate(uid, loc)
    })

    /**
     * Handle user volume broadcast
     */
    socket.on('my-volume', function (data) {
      let uid = getUserId(socket)
      volumes[uid] = data
    })

    /**
     * Handle user announcement broadcast
     */
    socket.on('my-announcement', function (data) {
      io.emit('announcement', data)
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
      if (Object.keys(users).length == 0) {
        log('No users left - cancelling updates')
        stopUpdates()
      }
    })
  })
}
