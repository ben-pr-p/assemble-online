import Emitter from 'component-emitter'
import wildcardify from 'wildcards'

const ToPeers = new Emitter()
const FromPeers = new Emitter()
const Bus = new Emitter()

const _connections = new Set()

wildcardify(ToPeers, 'connected-to-*', (ev, data) => {
  _connections.add(ev.split('-')[2])
})

wildcardify(ToPeers, 'disconnected-from-*', (ev, data) => {
  _connections.delete(ev.split('-')[2])
})

const Connections = {
  _connections,

  hasAllOf: setOrArray => (members =>
      members.filter(m => !_connections.has(m)).length == 0
    )([...setOrArray])
}

export { ToPeers, FromPeers, Bus, Connections }
