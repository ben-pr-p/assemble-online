'use strict'

const debug = require('debug')
const socketEvents = require('socket.io-events')
const LocationManager = require('../helpers/location-manager')
const identifyUserBrowser = require('../helpers/user-browser-id')
const help = require('./help')
const db = require('../db-api')

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

    this.sesh = {
      _id: null,
      room: room,
      announcements: [],
      agenda: []
    }

    this.state = {
      users: new Map(),
      volumes: new Map(),
      sockets: new Map(),
      userIdFromSocketId: new Map(),
      dimGrowth: 1,
      dimensions: Object.assign({}, BASE_DIMENSIONS),
      colorIdx: 0,
      lm: new LocationManager(),
      modifyUpdates: this.modifyUpdates.bind(this)
    }

    this.log('Creating self...')
    db.session.create({room}, (err, sesh) => {
      if (err) {
        this.log('Could not create self: %j', err)
        throw new Error('Could not create new session')
      }

      for (let prop in sesh) {
        this.sesh[prop] = sesh[prop]
      }

      this.nsp = io.of('/' + room)
      this.router = socketEvents()

      this.updateIntervalId = null
      this.destroyTimeoutId = null

      this.parentEraseMe = parentEraseMe
      this.bindEvents()

      this.log('I am risen!')
    })
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

      db.session.end(this.sesh._id, (err, ended) => {
        if (err) {
          this.log('Could not end self: %j', err)
          throw new Error('Could not end session %', this.sesh._id)
        }

        this.log('Successfully ended session %s', ended.id)
        this.parentEraseMe(this.sesh.room)
      })

    }, 5000)
  }

  onConnect (socket) {
    this.log('New connection')
  }

  onDisconnect (socket) {
    /*
     * DB TODO: Session.registerUserExit
     */

    const user = help.getUser(this.state, socket)
    if (!user) {
      this.log('Unknown user disconnect')
    } else {
      this.log('User %s disconnected', user.id)
      help.removeUser(this.sesh, this.state, user, socket, (err, s) => {
        this.log('Successfully registered %s leaving %s', user.id, s.id)
      })
    }

    if (this.state.users.size == 0) { // Stop sending updates
      this.log('No users left - cancelling updates')
      this.stopUpdates()
      this.destroySelf()
    } else {
      this.nsp.emit('users', [...this.state.users])
    }
  }

  bindEvents () {
    const emitAll = (eventName, data) => {
      this.nsp.emit(eventName, data)
    }

    this.router.use('/user', createUserRouter(this.sesh, this.state, emitAll))
    this.router.use('/location', createLocationRouter(this.sesh, this.state, emitAll))
    this.router.use('/volume', createVolumeRouter(this.sesh, this.state, emitAll))
    this.router.use('/announcement', createAnnouncementRouter(this.sesh, this.state, emitAll))
    this.router.use('/agenda', createAgendaRouter(this.sesh, this.state, emitAll))

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

      this.log('Connected to namespace %s', this.sesh.room)
      socket.on('connect', this.onConnect.bind(this, socket))
      socket.on('disconnect', this.onDisconnect.bind(this, socket))
    })

  }

  /**
  * MANAGING REGULAR UPDATING
  */

  emitTo (uid, event, data) {
    this.nsp.to(this.state.sockets.get(uid).id).emit(event, data)
  }

  modifyUpdates () {
    if (!this.updateIntervalId && this.state.users.size > 0) {
      this.startUpdates()
    }

    if (this.updateIntervalId && this.state.users.size == 0) {
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
    this.nsp.emit('locations', this.state.lm.getLocations())
    this.nsp.emit('volumes', [...this.state.volumes])
    this.state.sockets.forEach((socket, uid) => {
      this.nsp.to(socket.id).emit('distances', this.state.lm.distancesFor(uid))
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
      this.state.dimGrowth = newDimGrowth
      this.state.dimensions = {
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
    return this.state.users.size
  }

  containsUser (ubid) {
    for (let uid of this.state.users.keys()) {
      let socket = this.state.sockets.get(uid)
      let ub = identifyUserBrowser(socket.sock.handshake.address, socket.sock.request.headers['user-agent'])
      if (ub == ubid) return true
    }
    return false
  }
}

