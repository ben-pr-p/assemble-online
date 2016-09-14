export default function (params) {
  const {sesh, state, on, emit, socket} = params

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
    socket.emit('/agenda/edit', raw)
  }

  socket.on('agenda', handle)

  function handle (raw) {
    if (raw) {
      sesh.agenda = raw
      emit('agenda', sesh.agenda)
    }
  }
}
