export default function (params) {
  const {sesh, state, on, emit, socket} = params

  on('webrtc/config', config)

  function config (data) {
    socket.emit('/webrtc/config', data)
  }

  socket.on('webrtc-config', handle)

  function handle (raw) {
    emit(`webrtc-config-${raw.from}`, raw.data)
  }
}
