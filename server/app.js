'use strict'

/*
 * KNOWN ERRORS
  * If the server goes down while a client is still connected to a room, the
    * socket will have no record of that rooms namespace (only created on a GET
    * request) and so will be unable to connect
 */

const log = require('debug')('assemble:app')
const path = require('path')
const express = require('express')
const io = require('socket.io')
const pug = require('pug')
const easyrtc = require('easyrtc')
const http = require('http')
const spawnRoom = require('./spawn-room')
const app = express()

const staticDir = path.resolve(__dirname + '/../build')

const server = http.createServer(app)
const socketServer = io.listen(server, {'log level':1})

const rooms = {}

function destroyRoom (roomName) {
  rooms[roomName] = null
  delete rooms[roomName]
}

function ensureRoom (req, res, next) {
  if (rooms[req.params.room]) return next()

  if (req.params.room.indexOf('.') > -1)
    return res.status(400).json({error: 'invalid room name'})

  log('Creating room %s', req.params.room)
  rooms[req.params.room] = spawnRoom(socketServer, req.params.room, destroyRoom)
  next()
}

app.use('/', express.static(staticDir))

app.set('view engine', 'pug')
app.set('views', './server/views')

app.get('/', function (req, res) {
  res.render('portal')
})

app.get('/room-status', function (req, res) {
  const result = {}
  for (let room in rooms)
    result[room] = rooms[room].getNumOccupants()

  log(Object.keys(rooms))
  res.json(result)
})

app.get('/:room', ensureRoom, function (req, res) {
  log('Request /%s', req.params.room)
  res.render('room', {room: req.params.room})
})

/*
 * Create rooms when necessary
 */

easyrtc.setOption('logLevel', 'debug')
easyrtc.setOption('roomDefaultEnable', false)

/*
 * Overriding default listener to get logs
 */
easyrtc.events.on('easyrtcAuth', function (socket, easyrtcid, msg, socketCb, cb) {
  easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCb, function (err, connectionObj) {
    if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
      return cb(err, connectionObj)
    }

    connectionObj.setField('credential', msg.msgData.credential, {'isShared': false})
    log('%s credential saved', connectionObj.getFieldValueSync('credential'))
    cb(err, connectionObj)
  })
})

/*
 * Print out the credneitals for every room join
 */
easyrtc.events.on('roomJoin', function (connectionObj, roomName, roomParameter, cb) {
  log(`${connectionObj.getEasyrtcid()} credential retrieved`, connectionObj.getFieldValueSync('credential'))
  easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, cb)
})

/*
 * Start EasyRTC server
 */
const rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
  log('initated easyrtc')

  rtcRef.events.on('roomCreate', function (appObj, creatorConnectionObj, roomName, roomOptions, cb) {
    log('roomCreate fired! creating: %s', roomName)

    appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, cb)
  })
})

let PORT = process.env.PORT
if (!PORT) {
  log('Missing env var PORT, using 3000')
  PORT = 3000
}

log('Listening on PORT %d', PORT)
server.listen(PORT)
