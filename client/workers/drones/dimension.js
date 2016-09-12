export default function (params) {
  const {sesh, state, on, emit, socket} = params

  socket.on('dimensions', handle)

  function handle (raw) {
    state.dimensions = raw
    emit('dimensions', state.dimensions)
  }
}
