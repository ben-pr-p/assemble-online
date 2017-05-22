import Sock from '../../lib/sock'
import Emitter from 'component-emitter'

let _switchboard = {}
let _myStream = null
const streams = {}

const operator = new Emitter()

Sock.on('switchboard', switches => {
  _switchboard = switches
  operator.emit('update')
})

// Should we relay or send our own local stream?
operator.getFor = uid =>
  _switchboard[uid] ? streams[_switchboard[uid]] : _myStream

operator.getOne = uid => streams[Object.keys(streams)[0]]

operator.stream = {
  setMine: stream => {
    _myStream = stream
    operator.emit('update')
  },

  getMine: () => _myStream,

  register: (uid, stream) => {
    streams[uid] = stream
  },

  forget: uid => {
    streams[uid] = null
    delete streams[uid]
  }
}

export default operator
