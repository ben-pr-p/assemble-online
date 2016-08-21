'use strict'

const debug = require('debug')
const LocationManager = require('./helpers/location-manager')
const identifyUserBrowser = require('./helpers/user-browser-id')

const UPDATE_INTERVAL = 50
const BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
const USERS_PER_SCREEN = 4
const spawnlog = debug('assemble:room-spawner')

const colorScale = ['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6']

module.exports = function (io, room, destroySelf) {
  spawnlog('Spawning room %s...', room)
  return new Room(io, room, destroySelf)
}

class Room {
  constructor (io, room, parentEraseMe) {
    this.log = debug('assemble:room:' + room)

    this.lm = new LocationManager()
    this.room = room
    this.nsp = io.of('/' + room)

    this.users = new Map()
    this.volumes = new Map()
    this.announcement = null
    this.sockets = new Map()
    this.userIdFromSocketId = new Map()

    this.dimGrowth = 1
    this.dimensions = Object.assign({}, BASE_DIMENSIONS)

    this.updateIntervalId = null
    this.destroyTimeoutId = null

    this.parentEraseMe = parentEraseMe
    this.bindEvents()

    this.log('I am risen!')
    this.colorIdx = 0
  }

  resetDefaults () {
    this.users = new Map()
    this.volumes = new Map()
    this.announcement = null
    this.sockets = new Map()
    this.userIdFromSocketId = new Map()

    this.dimGrowth = 1
    this.dimensions = Object.assign({}, BASE_DIMENSIONS)

    this.log('I am reset!')
    this.colorIdx = 0
  }

  destroySelf () {
    this.resetDefaults()

    this.destroyTimeoutId = setTimeout(() => {
      Object.keys(this.nsp.connected).forEach(id => {
        this.nsp.connected[id].disconnect()
        this.nsp.connected[id].close()
      })

      this.nsp.removeAllListeners()
      this.parentEraseMe(this.room)
    }, 5000)
  }

  onConnect (socket) {
    this.log('New connection')
  }

  onMe (socket, user) {
    let firstUser = this.users.size == 0

    if (this.users.has(user.id)) {
      this.log('Got existing user %s update', user.id)

      let existing = this.users.get(user.id)
      if (existing.x)
        user.x = existing.x
      if (existing.y)
        user.y = existing.y
      if (existing.easyrtcid)
        user.easyrtcid = existing.easyrtcid
      if (existing.color)
        user.color = existing.color

      this.users.set(user.id, user)
      this.log('Serving users %j', [...this.users])
      return this.nsp.emit('users', [...this.users])
    }

    user.color = colorScale[this.colorIdx]
    this.colorIdx = (this.colorIdx + 1) % colorScale.length

    this.log('Got new user %s', user.id)
    this.log('Assigned %s color %s', user.id, user.color)

    this.users.set(user.id, user)
    this.sockets.set(user.id, socket)
    this.userIdFromSocketId.set(socket.id, user.id)
    this.lm.handleLocationUpdate(user.id, {x: 0, y: 0})

    this.nsp.emit('users', [...this.users])
    this.nsp.emit('dimensions', this.dimensions)
    this.nsp.emit('locations', this.lm.getLocations())
    if (firstUser) this.startUpdates()
  }

  onTrashMe (socket) {
    const user = this.getUser(socket)
    if (!user) {
      this.log('Unknown user requesting trashing')
    } else {
      this.log('User %j requested trashing', user)
      this.removeUser(user, socket)
    }
  }

  onMyLocation (socket, loc) {
    const uid = this.getUserId(socket)
    this.lm.handleLocationUpdate(uid, loc)
  }

  onMyVolume (socket, data) {
    const uid = this.getUserId(socket)
    this.volumes.set(uid, data)
  }

  onMyAnnouncement (socket, data) {
    const clone = {}
    const byUser = {}

    for (let type in data.responses) {
      clone[type] = [] // for 19j

      data.responses[type].forEach(response => {
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

    this.announcement = data
    this.announcement.responses = clone
    this.nsp.emit('announcement', this.announcement)
  }

  onRequestAnnouncement (socket) {
    this.log('User %s requested announcement', this.getUserId(socket))
    this.nsp.emit('announcement', this.announcement)
  }

  onDisconnect (socket) {
    const user = this.getUser(socket)
    if (!user) {
      this.log('Unknown user disconnect')
    } else {
      this.log('User %s disconnected', user.id)
      this.removeUser(user, socket)
    }

    if (this.users.size == 0) { // Stop sending updates
      this.log('No users left - cancelling updates')
      this.stopUpdates()
      this.destroySelf()
    } else {
      this.nsp.emit('users', [...this.users])
    }
  }

  bindEvents () {
    this.nsp.on('connection', (socket) => {
      if (this.destroyTimeoutId) {
        this.log('Cancelling self destroy')
        clearTimeout(this.destroyTimeoutId)
        this.destroyTimeoutId = null
      }

      this.log('Connected to namespace %s', this.room)
      socket.on('connect', this.onConnect.bind(this, socket))
      socket.on('me', this.onMe.bind(this, socket))
      socket.on('trash-me', this.onTrashMe.bind(this, socket))
      socket.on('my-location', this.onMyLocation.bind(this, socket))
      socket.on('my-volume', this.onMyVolume.bind(this, socket))
      socket.on('my-announcement', this.onMyAnnouncement.bind(this, socket))
      socket.on('request-announcement', this.onRequestAnnouncement.bind(this, socket))
      socket.on('disconnect', this.onDisconnect.bind(this, socket))
    })
  }

  /**
  * HELPERS
  */

  getUser (socket) {
    return this.users.get(this.getUserId(socket))
  }

  getUserId (socket) {
    return this.userIdFromSocketId.get(socket.id)
  }

  removeUser (user, socket) {
    this.log('Removing all traces of %j', user)
    this.lm.removeUser(user.id)
    this.sockets.delete(user.id)
    this.users.delete(user.id)
    socket.disconnect()
  }

  /**
  * MANAGING REGULAR UPDATING
  */

  emitTo (uid, event, data) {
    this.nsp.to(this.sockets.get(uid).id).emit(event, data)
  }


  startUpdates () {
    if (!this.updateIntervalId) {
      this.updateIntervalId = setInterval(this.sendUpdates.bind(this), UPDATE_INTERVAL)
    }
  }

  stopUpdates () {
    clearInterval(this.updateIntervalId)
    this.updateIntervalId = null
  }

  areUpdatesRunning () {
    return !!this.updateIntervalId
  }

  sendUpdates () {
    this.nsp.emit('locations', this.lm.getLocations())
    this.nsp.emit('volumes', [...this.volumes])
    this.sockets.forEach((socket, uid) => {
      this.nsp.to(socket.id).emit('distances', this.lm.distancesFor(uid))
    })
  }

  /**
  * MANAGE DIMENSIONS
  */

  setDimensions (n) {
    let newDimGrowth = (n > 0) ? Math.ceil(n / 4) : 1
    if (newDimGrowth == this.dimGrowth) {
      return false
    } else {
      this.dimGrowth = newDimGrowth
      this.dimensions = {
        x: BASE_DIMENSIONS.x * this.dimGrowth,
        y: BASE_DIMENSIONS.y * this.dimGrowth
      }
      return true
    }
  }

  /**
   * ACCESSIBLE BY OUTSIDE
   */
  getNumOccupants () {
    return this.users.size
  }

  containsUser (ubid) {
    for (let uid of this.users.keys()) {
      let socket = this.sockets.get(uid)
      let ub = identifyUserBrowser(socket.handshake.address, socket.request.headers['user-agent'])
      if (ub == ubid) return true
    }
    return false
  }
}

