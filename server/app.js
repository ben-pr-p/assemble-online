var log = require('debug')('assemble:app')
var path = require('path')
var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

var staticDir = path.resolve(__dirname + '/../build')
app.use(express.static(staticDir))

// require('./models', app)
// var db = require('db')

var PORT = process.env.PORT
if (!PORT) {
  log('Missing env var PORT, using 3000')
  PORT = 3000
}

log('Listening on PORT %d', PORT)
http.listen(process.env.PORT || 3000)

var users = []
var sockets = {}

io.on('connection', function (socket) {

  socket.on('connect', function () {
    log('New connection, sending users')
    socket.emit('users', users)
  })

  socket.on('newuser', function (user) {
    log('Got new user %s', user.id)

    users.push(user)
    sockets[user.id] = socket

    socket.emit('users', users)
  })

  socket.on('disconnect', function () {
    var user = users.filter(u => sockets[u.id] == socket)
    log('User %s disconnected', user.id)

    users.splice(users.indexOf(user), 1)
  })
})

function sendUpdates () {
  users.forEach(u => {
    if (sockets[u.id]) {
      sockets[u.id].emit('users', users)
    }
  })
  log('Sent updates to %d users', users.length)
}
