export default function (state, on, emit, socket) {
  socket.on('dimensions', handle)
  function handle (raw) {
    state.dimensions = raw
    emit('dimensions', state.dimensions)
  }
}
