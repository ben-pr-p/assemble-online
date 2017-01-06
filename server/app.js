/*
 * Dependencies
 */
const log = require('debug')('assemble:app')
const path = require('path')
const express = require('express')
const io = require('socket.io')
const pug = require('pug')
const http = require('http')
const spawnSession = require('./socket')

/*
 * ------------------------- Begin config --------------------------
 */
const app = express()
const staticDir = path.resolve(__dirname + '/../build')

app.use('/', express.static(staticDir))
app.set('view engine', 'pug')
app.set('views', './server/views')

/*
 * Express endpoints
 */

const sessions = {}

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

app.get('/room', function (req, res) {
  res.redirect('/')
})

app.get('/room/:room',
  /* Reject bad room names */
  (req, res, next) => req.params.room.indexOf('.') > -1
    ? res.status(400).json({error: 'invalid room name'})
    : next()
  ,
  /* Ensure room exists in redis */
  ensureRoom,
  (req, res) => {
    log('Request GET /%s', req.params.room)
    res.render('room', {room: req.params.room})
  }
)

function ensureRoom (req, res, next) {
  log('Currently have sessions %j', Object.keys(sessions))

  if (sessions[req.params.room]) return next()

  log('Creating session for room %s', req.params.room)
  sessions[req.params.room] = spawnSession(socketServer, req.params.room, destroyRoom)
  next()
}

/*
 * Create
 * -- express server
 * -- socket server
 * -- redis client
 */
const server = http.createServer(app)
const socketServer = io.listen(server, {'log level':1})
const redis = require('redis').createClient(process.env.REDIS_URL)

let PORT = process.env.PORT
if (!PORT) {
  log('Missing env var PORT, using 3000')
  PORT = 3000
}

log('Listening on PORT %d', PORT)
server.listen(PORT)
