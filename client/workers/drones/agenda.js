export default function (state, on, emit, socket) {
  on('agenda/new', announceNew)
  on('agenda/edit', announceEdit)

  function announceNew (raw) {
    if (!state.me) return handleError('Cannot announce agenda item - me is not defined')

    raw.author = state.me.id
    socket.emit('/agenda/new', raw)
  }

  function announceEdit (raw) {
    if (!state.me) return handleError('Cannot announce agenda item - me is not defined')

    raw.author = state.me.id
    socketEmit('/agenda/edit', raw)
  }

  socket.on('agenda', handle)
  function handle (raw) {
    if (raw) emit('agenda', raw)
  }
}
