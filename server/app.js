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
    var existing = users.filter(u => u.id == user.id)[0]
    if (existing) {
      log('Got existing user %s update', user.id)
      users.splice(users.indexOf(existing), 1)

      user.x = existing.x
      user.y = existing.y

      users.push(user)
      return socket.emit('users', users)
    }

    log('Got new user %s', user.id)

    users.push(user)
    sockets[user.id] = socket

    socket.emit('users', users)
  })

  socket.on('movement', function(user) {
    log('User %s moved', user.id)

    var moved = users.filter(u => u.id == user.id)[0]
    moved.x = user.x
    moved.y = user.y

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
