import Emitter from 'component-emitter'
const ToPeers = new Emitter()
const FromPeers = new Emitter()
export default { ToPeers, FromPeers }
