export default function (params) {
  const {sesh, state, on, emit, socket} = params

  on('volume/mine', announce)

  function announce (vol) {
    socket.emit('/volume/mine', vol)
  }

  socket.on('volumes', handle)

  function handle (raw) {
    state.volumes = new Map(raw)
    state.volumes.forEach((value, uid) => {
      if (uid)
        emit(`volume-${uid}`, value)
    })
  }
}
