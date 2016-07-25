var log = require('debug')('assemble:app')
var path = require('path')
var express = require('express')
var io = require('socket.io')
var easyrtc = require('easyrtc')
var http = require('http')
var app = express()

var staticDir = path.resolve(__dirname + '/../build')
app.use('/', express.static(staticDir))

var server = http.createServer(app)
var socketServer = io.listen(server, {'log level':1})

easyrtc.setOption('logLevel', 'debug')

/*
 * Overriding default listener to get logs
 */
easyrtc.events.on('easyrtcAuth', function(socket, easyrtcid, msg, socketCb, cb) {
  easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCb, function(err, connectionObj){
    if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
      return cb(err, connectionObj)
    }

    connectionObj.setField('credential', msg.msgData.credential, {'isShared': false})
    log(`${easyrtcid} credential saved`, connectionObj.getFieldValueSync('credential'))
    cb(err, connectionObj)
  })
})

/*
 * Print out the credneitals for every room join
 */
easyrtc.events.on('roomJoin', function(connectionObj, roomName, roomParameter, cb) {
  log(`${connectionObj.getEasyrtcid()} credential retrieved`, connectionObj.getFieldValueSync('credential'))
  easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, cb)
})

/*
 * Start EasyRTC server
 */
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
  log('initated easyrtc')

  rtcRef.events.on('roomCreate', function(appObj, creatorConnectionObj, roomName, roomOptions, cb) {
    log(`roomCreate fired! creating: ${roomName}`)

    appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, cb)
  })
})

var PORT = process.env.PORT
if (!PORT) {
  log('Missing env var PORT, using 3000')
  PORT = 3000
}

log('Listening on PORT %d', PORT)
server.listen(PORT)
