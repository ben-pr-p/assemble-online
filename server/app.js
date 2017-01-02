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
const fs = require('fs')

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
  log('Currently have sessions %j', Object.keys(sessions))

  if (sessions[req.params.room]) return next()

  log('Creating session for room %s', req.params.room)
  sessions[req.params.room] = spawnSession(socketServer, req.params.room, destroyRoom)
  next()
}
