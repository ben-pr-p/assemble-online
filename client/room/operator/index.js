import Sock from '../../lib/sock'
import Emitter from 'component-emitter'

const initialState = {
  toRelay: {
    original: null,
    immediate: null,
    stream: null
  },
  relayingTo: [] // array of uids
}

const state = Object.assign(
  {
    userStreams: {},
    myStream: null
  },
  initialState
)

const operator = new Emitter()

Sock.on('switchboard', data => {
  Object.assign(state, data)

  state.toRelay.stream = state.toRelay.original == Sock.id
    ? state.myStream
    : state.userStreams[state.toRelay.immediate]

  operator.emit('update')
})

Sock.on(
  'broadcasting',
  broadcasting =>
    !broadcasting &&
    (Object.assign(state, initialState), operator.emit('update'))
)

// Should we relay or send our own local stream?
operator.getFor = uid => {
  const s = uid == Sock.id
    ? state.myStream
    : state.toRelay.original
        ? state.relayingTo.includes(uid) ? state.toRelay.stream : null
        : state.myStream

  return s
}

operator.shouldConnect = uid =>
  state.toRelay.original
    ? state.relayingTo.includes(uid)
        ? 'receive'
        : state.toRelay.immediate == uid ? 'receive' : false
    : false

operator.isRelayMode = () => state.toRelay.original != null
operator.isSendingTo = uid => state.relayingTo.includes(uid)

operator.stream = {
  setMine: stream => {
    state.myStream = stream
    operator.emit('update')
  },

  getMine: () => state.myStream,

  getToRelay: () => {
    return state.toRelay.stream
  },

  register: (uid, stream) => {
    state.userStreams[uid] = stream
    if (state.toRelay.immediate && state.toRelay.immediate == uid) {
      state.toRelay.stream = stream
      operator.emit('update')
    }
  },

  forget: uid => {
    state.userStreams[uid] = null
    delete state.userStreams[uid]
  }
}

export default operator
