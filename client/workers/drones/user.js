export default function (params) {
  const {sesh, state, on, emit, socket} = params

  on('user/new', announce)
  on('user/trash', trash)

  function announce (ev, newme) {
    let brandNew = true
    if (state.me) brandNew = false

    state.me = ev
    if (brandNew) socket.emit('/user/new', state.me)
    else socket.emit('/user/update', state.me)
  }

  function trash () {
    state.me = null
    socket.emit('/user/trash')
  }

  socket.on('connect', handle)
  socket.on('users', handle)

  function handle (raw) {
    if (raw) {
      const map = new Map(raw)

      state.users = map
      emit('users', [...state.users])

      map.forEach((user, uid) => {
        state.easyrtcids.set(uid, user.easyrtcid)
      })
    }
  }

}
