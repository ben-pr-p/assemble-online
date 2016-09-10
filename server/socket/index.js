'use strict'

const debug = require('debug')
const socketEvents = require('socket.io-events')
const LocationManager = require('../helpers/location-manager')
const identifyUserBrowser = require('../helpers/user-browser-id')
const help = require('./help')

let db
if (process.env.DB)
  db = require('./db-api')

const UPDATE_INTERVAL = 50
const BASE_DIMENSIONS = {x: 2700, y: 1700} // mostly arbitrary, but a little bit smaller than macbook pro 15 inch screen
const USERS_PER_SCREEN = 4
const spawnlog = debug('assemble:session-spawner')

const createUserRouter = require('./user')
const createLocationRouter = require('./location')
const createVolumeRouter = require('./volume')
const createAnnouncementRouter = require('./announcement')
const createAgendaRouter = require('./agenda')

module.exports = function (io, room, destroySelf) {
  spawnlog('Spawning session for room %s...', room)
  return new Session(io, room, destroySelf)
}

/**
 * Routes:
 *    '${nsp}/announcement/new'
 *    '${nsp}/announcement/response'
 *    '${nsp}/announcement/request'
 *
 *    '${nsp}/location/mine'
 *
 *    '${nsp}/announcement/request'
 *
 *    '${nsp}/user/new'
 *    '${nsp}/user/update'
 *    '${nsp}/user/trash'
 *
 *    '${nsp}/volume/mine'
 */

class Session {
  constructor (io, room, parentEraseMe) {
    this.log = debug('assemble:room:' + room)

    this.nsp = io.of('/' + room)
    this.router = socketEvents()

    this.data = {
      room: room,
      users: new Map(),
      volumes: new Map(),
      sockets: new Map(),
      userIdFromSocketId: new Map(),
      announcement: null,
      agenda: [],
      dimGrowth: 1,
      dimensions: Object.assign({}, BASE_DIMENSIONS),
      colorIdx: 0,
      lm: new LocationManager(),
      modifyUpdates: this.modifyUpdates.bind(this)
    }

    this.updateIntervalId = null
    this.destroyTimeoutId = null

    this.parentEraseMe = parentEraseMe
    this.bindEvents()

    this.log('I am risen!')

    /*
     * DB TODO: register self / create
     */
  }

  destroySelf () {
    this.destroyTimeoutId = setTimeout(() => {
      Object.keys(this.nsp.connected).forEach(id => {
        this.log(this.nsp.connected[id])
        if (this.nsp.connected[id].disconnect)
          this.nsp.connected[id].disconnect()
        if (this.nsp.connected[id].close)
          this.nsp.connected[id].close()
      })

      this.nsp.removeAllListeners()
      this.parentEraseMe(this.data.room)
      /*
       * DB TODO: End self
       */
    }, 5000)
  }

  onConnect (socket) {
    this.log('New connection')
  }

  onDisconnect (socket) {
    /*
     * DB TODO: Session.registerUserExit
     */

    const user = help.getUser(this.data, socket)
    if (!user) {
      this.log('Unknown user disconnect')
    } else {
      this.log('User %s disconnected', user.id)
      help.removeUser(this.data, user, socket)
    }

    if (this.data.users.size == 0) { // Stop sending updates
      this.log('No users left - cancelling updates')
      this.stopUpdates()
      this.destroySelf()
    } else {
      this.nsp.emit('users', [...this.data.users])
    }
  }

  bindEvents () {
    const emitAll = (eventName, data) => {
      this.nsp.emit(eventName, data)
    }

    this.router.use('/user', createUserRouter(this.data, emitAll))
    this.router.use('/location', createLocationRouter(this.data, emitAll))
    this.router.use('/volume', createVolumeRouter(this.data, emitAll))
    this.router.use('/announcement', createAnnouncementRouter(this.data, emitAll))
    this.router.use('/agenda', createAgendaRouter(this.data, emitAll))

    this.router.on('*', (sock, args, next) => {
      this.log('Got undefined event %s', args[0])
      this.log('with data %j', args[1])
      next()
    })

    this.nsp.use(this.router)

    this.nsp.on('connection', (socket) => {

      if (this.destroyTimeoutId) {
        this.log('Cancelling self destroy')
        clearTimeout(this.destroyTimeoutId)
        this.destroyTimeoutId = null
      }

      this.log('Connected to namespace %s', this.data.room)
      socket.on('connect', this.onConnect.bind(this, socket))
      socket.on('disconnect', this.onDisconnect.bind(this, socket))
    })

  }

  /**
  * MANAGING REGULAR UPDATING
  */

  emitTo (uid, event, data) {
    this.nsp.to(this.data.sockets.get(uid).id).emit(event, data)
  }

  modifyUpdates () {
    if (!this.updateIntervalId && this.data.users.size > 0) {
      this.startUpdates()
    }

    if (this.updateIntervalId && this.data.users.size == 0) {
      this.stopUpdates()
    }
  }

  startUpdates () {
    if (!this.updateIntervalId) {
      this.log('Starting updates')
      this.updateIntervalId = setInterval(this.sendUpdates.bind(this), UPDATE_INTERVAL)
    }
  }

  stopUpdates () {
    this.log('Stopping updates')
    clearInterval(this.updateIntervalId)
    this.updateIntervalId = null
  }

  areUpdatesRunning () {
    return !!this.updateIntervalId
  }

  sendUpdates () {
    this.nsp.emit('locations', this.data.lm.getLocations())
    this.nsp.emit('volumes', [...this.data.volumes])
    this.data.sockets.forEach((socket, uid) => {
      this.nsp.to(socket.id).emit('distances', this.data.lm.distancesFor(uid))
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
      this.data.dimGrowth = newDimGrowth
      this.data.dimensions = {
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
    return this.data.users.size
  }

  containsUser (ubid) {
    for (let uid of this.data.users.keys()) {
      let socket = this.data.sockets.get(uid)
      let ub = identifyUserBrowser(socket.sock.handshake.address, socket.sock.request.headers['user-agent'])
      if (ub == ubid) return true
    }
    return false
  }
}

