'use strict'

importScripts('http://cdn.socket.io/socket.io-1.1.0.js')

var events = {}
var socket = io()

var port, users, me, locations, volumes, dimensions

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

  emit('ready', true)
  on('me', announceMe)
  on('my-location', announceLocation)
  on('my-volume', announceVolume)
  on('my-announcement', announceAnnouncement)
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

onconnect = function (e) {
  initialize(e.ports[0])
}
