import Sock from '../../lib/sock'
import Emitter from 'component-emitter'

const state = {
  toRelay: {
    original: null,
    immediate: null,
    stream: null
  },
  relayingTo: [],     // array of uids
  myStream: null,
  userStreams: {},
  relayMode: false
}

const operator = new Emitter()

Sock.on('switchboard', data => {
  Object.assign(state, data)
  console.log(data)
  operator.emit('update')
})

// Should we relay or send our own local stream?
operator.getFor = uid => state.relayMode
  ? state.toRelay.stream
  : state.myStream

operator.shouldConnect = uid => state.relayMode
  ? state.relayingTo.includes(uid)
    ? 'receive'
    : state.toRelay.from == uid
      ? 'receive'
      : false
  : false

operator.stream = {
  setMine: stream => {
    state.myStream = stream
    operator.emit('update')
  },

  getMine: () => state.myStream,

  register: (uid, stream) => {
    state.userStreams[uid] = stream
  },

  forget: uid => {
    state.userStreams[uid] = null
    delete state.userStreams[uid]
  }
}

export default operator
