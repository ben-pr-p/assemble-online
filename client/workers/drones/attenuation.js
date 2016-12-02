export default function (params) {
  const {sesh, state, on, emit, socket} = params

  socket.on('attenuations', handle)

  function handle (raw) {
    if (raw) {
      for (let uid in raw) {
        emit(`attenuation-for-${uid}`, raw[uid])
      }

      state.attenuations = raw
    }
  }
}
