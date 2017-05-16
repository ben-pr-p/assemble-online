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
const redis = require('./redis')
const apps = require('./apps')
const checkBrowser = require('./check-browser')

const { objectify } = require('./utils')

/*
 * ------------------------- Begin config -------------------------
 */
const app = express()
const staticDir = path.resolve(__dirname + '/../build')

app.use('/', express.static(staticDir))
app.use(bodyParser.json())
app.set('view engine', 'pug')
app.set('views', './server/views')

/*
 * Create
 * -- express server
 * -- socket server
 * -- redis client
 */
const server = http.createServer(app)
const socketServer = io.listen(server, { 'log level': 1 })

// Self contained rest endpoints in /server/apps
app.use('/api', apps)

/*
 * Express endpoints
 */

app.get('/', (req, res) => res.render('portal'))
app.get('/blog', (req, res) => res.render('blog'))
app.get('/room', (req, res) => res.redirect('/'))

const namespaces = require('./namespaces')(socketServer)

app.get('/room/:room', checkBrowser, (req, res) => {
  log('Request GET /%s', req.params.room)

  /* Reject bad room names */
  if (encodeURIComponent(req.params.room) != req.params.room)
    return res.status(400).json(print({ error: 'invalid room name' }))

  /* Ensure room exists in redis */
  if (namespaces.has(req.params.room)) {
    log('Room %s exists', req.params.room)
  } else {
    log('Creating room %s', req.params.room)
    namespaces.create(req.params.room)
  }

  res.render('room', { room: req.params.room })
})

/*
 * For bandwidth testing
 */

const randomNumbers = new Array(1000000).fill(null).map(Math.random)
const randomMb = Buffer.from(randomNumbers)
app.get('/megabyte', (req, res) => res.send(randomMb))
app.post('/megabyte', (req, res) => res.sendStatus(200))

/*
 * Go!
 */

const PORT = process.env.PORT
  ? process.env.PORT
  : (log('Missing env var PORT, using 3000'), 3000)

log('Listening on PORT %d', PORT)
server.listen(PORT)
