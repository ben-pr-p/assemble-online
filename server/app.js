'use strict'

/*
 * Dependencies
 */
const log = require('debug')('assemble:app')
const path = require('path')
const express = require('express')
const io = require('socket.io')
const pug = require('pug')
const http = require('http')
const bodyParser = require('body-parser')

// Register mongoose models
require('./models')()

/*
 * Local dependencies
 */
const spawnSession = require('./socket')
const identifyUserBrowser = require('./helpers/user-browser-id')

/*
 * Begin config
 */
const app = express()

const staticDir = path.resolve(__dirname + '/../build')

const server = http.createServer(app)
const socketServer = io.listen(server, {'log level':1})

const sessions = {}
const remoteLocations = new Map()

app.use(bodyParser.json())
app.use('/', express.static(staticDir))

app.set('view engine', 'pug')
app.set('views', './server/views')

app.get('/', function (req, res) {
  res.render('portal')
})

app.get('/blog', function (req, res) {
  res.render('blog')
})

app.get('/room-status', function (req, res) {
  const result = {}

  for (let room in sessions) {
    let numOccupants = sessions[room].getNumOccupants()
    if (numOccupants > 0)
      result[room] = numOccupants
  }

  res.json(result)
})

app.get('/room/:room', rejectBadRooms, ensureRoom, function (req, res) {
  log('Request GET /%s', req.params.room)
  res.render('room', {room: req.params.room})
})

app.get('/room', function (req, res) {
  res.redirect('/')
})

let PORT = process.env.PORT
if (!PORT) {
  log('Missing env var PORT, using 3000')
  PORT = 3000
}

log('Listening on PORT %d', PORT)
server.listen(PORT)

function destroyRoom (roomName) {
  log('Destroying room %s', roomName)

  socketServer.nsps[roomName] = null
  delete socketServer.nsps[roomName]

  sessions[roomName] = null
  delete sessions[roomName]
}

function rejectBadRooms (req, res, next) {
  if (req.params.room.indexOf('.') > -1)
    return res.status(400).json({error: 'invalid room name'})
  return next()
}

function ensureRoom (req, res, next) {
  log('Current have sessions %j', Object.keys(sessions))

  if (sessions[req.params.room]) return next()

  log('Creating session for room %s', req.params.room)
  sessions[req.params.room] = spawnSession(socketServer, req.params.room, destroyRoom)
  next()
}

function preventDuplicateJoin (req, res, next) {
  const ipaddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const uagent = req.headers['user-agent']
  const ubid = identifyUserBrowser(ipaddress, uagent)
  log('User is %s', ubid)

  // if the user isn't anywhere, we're good
  if (!remoteLocations.has(ubid)) {
    log('User brand new - we good')
    remoteLocations.set(ubid, req.params.room)
    return next()
  }
  log('User was previously in %s', remoteLocations.get(ubid))

  // if the user is trying to go a room they're already in, we're good
  const prevroom = remoteLocations.get(ubid)
  if (prevroom == req.params.room) {
    log('User already in room %s - we good', prevroom)
    return next()
  }

  // if the room they were in doesn't exist, we're good
  if (!sessions[prevroom]) {
    log('Previous room %s destroyed - we good', prevroom)
    remoteLocations.set(ubid, req.params.room)
    return next()
  }

  // otherwise, they better have left the room they were previously in
  if (sessions[prevroom].containsUser(ubid)) {
    log('User is still in %s - error, we bad', prevroom)
    return res.render('duplicate-join-error')
  } else {
    log('User has left %s - we good', prevroom)
    remoteLocations.set(ubid, req.params.room)
    return next()
  }
}
