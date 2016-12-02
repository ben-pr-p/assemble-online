'use strict'

import io from 'socket.io-client'
import patchFn from 'socketio-wildcard'
import userDrone from './drones/user'
import locationDrone from './drones/location'
import dimensionDrone from './drones/dimension'
import attenuationDrone from './drones/attenuation'
import volumeDrone from './drones/volume'
import agendaDrone from './drones/agenda'
import webrtcDrone from './drones/webrtc'

// const patch = patchFn(io.Manager)
const events = {}
let port, socket, roomName, namespace, locations, dimensions, distances, announcement

const sesh = {
  _id: null,
  room: null,
  announcements: [],
  agenda: []
}

const state = {
  me: null,
  users: null,
  attenuations: {},
  translate: {x: 0, y: 0},
  locations: new Map(),
  dimensions: null
}

function ready (p) {
  port = p

  port.onmessage = handleMessage
  port.onerror = handleError

  on('room-name', handleRoomName)
}

function handleRoomName (roomName) {
  roomName = roomName
  namespace = '/' + roomName
  socket = io(namespace)

  // patch(socket)
  // const exclude = 'locations volumes distances announcements agenda webrtc-config'.split(' ')
  // socket.on('*', function (data) {
  //   let shouldThrow = !exclude.includes(data.data[0])
  //
  //   if (shouldThrow)
  //     handleError(`recieved-from-server: ${data.data[0]}: ${JSON.stringify(data.data[1])}`)
  // })

  initialize()
}

function initialize () {
  on('screen', receiveScreen)

  const params = {sesh, state, on, emit, socket}

  userDrone(params)
  locationDrone(params)
  dimensionDrone(params)
  attenuationDrone(params)
  volumeDrone(params)
  agendaDrone(params)
  webrtcDrone(params)

  socket.on('sesh', receiveSesh)
  socket.emit('request-sesh')
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
    handleError(`Boss posted message without event descriptor: ${msg.data}`)
  }

  let matches = null
  if (matches && msg.data.event.match(matches)) {
    handleError('Logging...', msg.data)
  }

  let handled = false
  if (events[msg.data.event]) {
    events[msg.data.event].forEach(fn => {
      handled = true
      fn(msg.data.data)
    })
  }

  if (!handled) {
    handleError(`Received unknown event ${JSON.stringify(msg.data)}`)
  }
}

function handleError (err) {
  emit('error', JSON.stringify({
    err: err,
    message: err.message,
    stack: err.stack
  }))
}

function emit (event, data) {
  port.postMessage({event, data})
}

function announceAnnouncement (msg) {
  msg.author = me.id
  msg.authorAvatar = me.avatar
  msg.authorName = me.name
  socket.emit('/announcement/mine', msg)
}

function announceResponse (data) {
  if (!me) return handleError('Cannot announce response - me is not defined')

  socket.emit('/announcement/response', data)
  me.badge = data.type
  socket.emit('/user/update', me)
}

function requestAnnouncement () {
  socket.emit('/announcement/request')
}

function handleAnnouncement (data) {
  if (data) {
    emit('announcement', data)

    let changed = false
    if (announcement && data.text != announcement.text) {
      changed = true
    }

    announcement = data

    if (changed) {
      me.badge = null
      socket.emit('me', me)
    }
  }
}

function receiveScreen (size) {
  state.screen = {
    x: size.x,
    y: size.y
  }
}

function receiveSesh (serverSesh) {
  const emitables = ['announcements', 'agenda', 'activeAgendaItem']
  for (let prop in serverSesh) {
    sesh[prop] = serverSesh[prop]
  }
  emitables.forEach(prop => {
    emit(prop, sesh[prop])
  })
}

onconnect = function (e) {
  ready(e.ports[0])
}
