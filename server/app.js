/*
 * Dependencies
 */
const log = require('debug')('assemble:app')
const path = require('path')
const express = require('express')
const io = require('socket.io')
const pug = require('pug')
const http = require('http')
const redis = require('./redis')

const {
  objectify
} = require('./utils')

/*
 * ------------------------- Begin config -------------------------
 */
const app = express()
const staticDir = path.resolve(__dirname + '/../build')

app.use('/', express.static(staticDir))
app.set('view engine', 'pug')
app.set('views', './server/views')

/*
 * Create
 * -- express server
 * -- socket server
 * -- redis client
 */
const server = http.createServer(app)
const socketServer = io.listen(server, {'log level':1})

/*
 * Express endpoints
 */

app.get('/', (req, res) => res.render('portal'))
app.get('/blog', (req, res) => res.render('blog'))
app.get('/room', (req, res) => res.redirect('/'))

app.get('/room-status', (req, res) =>
  redis.rooms.getAll()
  .then(rooms =>
    Promise.all(rooms.map(r => redis.room(r).users.size()))
    .then(sizes =>
      res.json(objectify(rooms, sizes))
    )
    .catch(err =>
      res.status(500).json(err))
  .catch(err =>
    res.status(500).json(err))
  )
)

const namespaces = require('./namespaces')(socketServer)

const ensureRoom = (req, res, next) => {
  namespaces.has(req.params.room]
    ? (log('Room %s exists', req.params.room),
        next())
    : (log('Creating room %s'),
        namespaces.create(req.params.room))
  next()
}

app.get('/room/:room',
  /* Reject bad room names */
  (req, res, next) =>
    name => encodeURIComponent(name) == name
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

const PORT = process.env.PORT
  ? process.env.PORT
  : (log('Missing env var PORT, using 3000'), 3000)

log('Listening on PORT %d', PORT)
server.listen(PORT)
