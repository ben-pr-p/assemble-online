'use strict'

import io from 'socket.io-client'
import patchFn from 'socketio-wildcard'
import userDrone from './drones/user'
import locationDrone from './drones/location'
import dimensionDrone from './drones/dimension'
import distanceDrone from './drones/distance'
import volumeDrone from './drones/volume'
import agendaDrone from './drones/agenda'

const patch = patchFn(io.Manager)
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
  easyrtcids: new Map(),
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
  patch(socket)

  /*
  socket.on('*', function (data) {
    emit(`recieved-from-server: ${data.data[0]}: ${JSON.stringify(data.data[1])})`)
  })
  */

  initialize()
}

function initialize () {
  on('screen', receiveScreen)

  const params = {sesh, state, on, emit, socket}

  userDrone(params)
  locationDrone(params)
  dimensionDrone(params)
  distanceDrone(params)
  volumeDrone(params)
  agendaDrone(params)

  /*
  on('my-announcement', announceAnnouncement)
  on('my-response', announceResponse)
  on('request-announcement', requestAnnouncement)
 */

  //socket.on('announcement', handleAnnouncement)
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
    handleError('Received unknown event', msg)
  }
}

function handleError (err) {
  emit('error', JSON.stringify(err))
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

onconnect = function (e) {
  ready(e.ports[0])
}

