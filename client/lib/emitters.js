import Emitter from 'component-emitter'

const ToPeers = new Emitter()
const FromPeers = new Emitter()
const Bus = new Emitter()

export { ToPeers, FromPeers, Bus }
