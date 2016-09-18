export default function (params) {
  const {sesh, state, on, emit, socket} = params

  on('agenda/new', announceNew)
  on('agenda/edit', announceEdit)
  on('agenda/reorder', announceReorder)
  on('agenda/advance', advance)

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

  function announceReorder (raw) {
    socket.emit('/agenda/reorder', raw)
  }

  function advance (raw) {
    socket.emit('/agenda/advance', raw)
  }

  socket.on('agenda', handle)
  socket.on('activeAgendaItem', handleActiveChange)

  function handle (raw) {
    if (raw) {
      sesh.agenda = raw
      emit('agenda', sesh.agenda)
    }
  }

  function handleActiveChange (value) {
    sesh.activeAgendaItem = value
    emit('activeAgendaItem', value)
  }
}
