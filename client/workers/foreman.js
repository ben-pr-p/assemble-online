'use strict'

importScripts('http://cdn.socket.io/socket.io-1.1.0.js')

var events = {}
var socket = io()

var port, users, me, locations, volumes, dimensions, screen

var translate = {x: 0, y: 0}

function initialize (p) {
  port = p
  port.onmessage = handleMessage
  port.onerror = handleError

  socket.on('connect', handleUsers)
  socket.on('users', handleUsers)
  socket.on('locations', handleLocations)
  socket.on('volumes', handleVolumes)
  socket.on('dimensions', handleDimensions)
  socket.on('announcement', handleAnnouncement)

  on('me', announceMe)
  on('my-location', announceLocation)
  on('my-volume', announceVolume)
  on('my-announcement', announceAnnouncement)

  on('screen', receiveScreen)
}

function on(event, fn) {
  if (!events[event]) {
    events[event] = []
  }
  events[event].push(fn)
}

function off(event, fn) {
  events[event] = events[event].filter(f => f != fn)
}

function handleMessage (msg) {
  if (!msg.data.event) {
    handleError(`Worker posted message without event descriptor: ${msg.data}`)
  }

  events[msg.data.event].forEach(fn => {
    fn(msg.data.data)
  })
}

function handleError (err) {
  emit('error', JSON.stringify(err))
}

function emit (event, data) {
  port.postMessage({event, data})
}

function handleUsers (data) {
  if (data) {
    users = new Map(data)
    emit('users', [...users])
  }
}

function announceMe (newme) {
  me = newme
  socket.emit('me', me)
}

function announceLocation (loc) {
  socket.emit('my-location', loc)
}

function announceAnnouncement (msg) {
  socket.emit('my-announcement, msg')
}

function announceVolume (vol) {
  socket.emit('my-volume', vol)
}

function handleLocations (data) {
  locations = new Map(data)
  emit('locations', [...locations])

  let myLocation = locations.get(me.id)
  if (isInFourth(myLocation)) {
    translate = calcTranslate(myLocation)
    emit('translate', translate)
  }
}

function handleVolumes (data) {
  volumes = new Map(data)
  emit('volumes', [...volumes])
}

function handleDimensions (data) {
  dimensions = data
  emit('dimensions', dimensions)
}

function handleAnnouncement (data) {
  emit('announcement', data)
}

function receiveScreen (size) {
  screen = {
    x: size.x,
    y: size.y
  }
}

function calcTranslate (loc) {
  var x = (-1) * loc.x + (screen.x / 2) - 25
  var y = (-1) * loc.y + (screen.y / 2) - 25

  return {x, y}
}

function isInFourth (loc) {
  var display = {
    x: loc.x + translate.x,
    y: loc.y + translate.y
  }

  handleError(display)

  var fourthWidth = screen.x / 4
  var fourthHeight = screen.y / 4
  if ((display.x < fourthWidth) || (display.x > (screen.x - fourthWidth)))
    return true
  if ((display.y < fourthHeight) || (display.y > (screen.y - fourthHeight)))
    return true
  return false
}

onconnect = function (e) {
  initialize(e.ports[0])
}
