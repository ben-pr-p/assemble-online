export default function (state, on, emit, socket) {
  on('volume/mine', announce)
  function announce (vol) {
    socket.emit('/volume/mine', vol)
  }

  socket.on('volumes', handle)
  function handle (raw) {
    state.volumes = new Map(raw)
    state.volumes.forEach((value, uid) => {
      emit(`volume-${uid}`, value)
    })
  }
}

