export default function (data, on, emit, socketOn, socketEmit) {
  on('announcement/new', announce)
  on('announcement/edit', announce)
  on('announcement/respond', respond)
  on('announcement/request', request)

  function announce (ev, newme) {
    if (!me) return handleError('Cannot announce announcement - me is not defined')

    msg.author = me.id
    msg.authorAvatar = me.avatar
    msg.authorName = me.name
    socketEmit('/announcement/mine', msg)
  }

  function request () {
    socketEmit('/announcement/request')
  }

  function respond (ev, raw) {
    if (!me) return handleError('Cannot announce response - me is not defined')

    socketEmit('/announcement/response', raw)
    data.me.badge = msg.type
    socketEmit('/user/update', data.me)
  }

  socketOn('announcement', handleCurrent)
  //socketOn('announcements', handleAll)

  function handleCurrent (raw) {
    if (raw) {
      emit('announcement', raw)

      let changed = false
      if (data.announcement && raw.text != data.announcement.text) {
        changed = true
      }

      data.announcement = raw

      if (changed) {
        data.me.badge = null
        socketEmit('me', data.me)
      }
    }
  }
}
