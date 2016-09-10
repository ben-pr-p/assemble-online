export default function (state, on, emit, socket) {
  on('location/delta', announce)
  function announce (loc) {
    const {dx, dy} = loc
    const base = state.locations.get(state.me.id)
    if (!base.x) base.x = 0
    if (!base.y) base.y = 0

    const x = constrain(base.x + dx, 0, state.dimensions.x)
    const y = constrain(base.y + dy, 0, state.dimensions.y)

    socket.emit('/location/delta', {x, y})
  }

  socket.on('locations', handle)
  function handle (raw) {
    state.locations = new Map(raw)
    state.locations.forEach((value, uid) => {
      emit(`location-${uid}`, value)
    })

    if (state.me) {
      const myLocation = state.locations.get(state.me.id)
      if (isInFourth(myLocation, state)) {
        state.translate = calcTranslate(myLocation)
        emit('translate', state.translate)
      }
    }
  }

  function constrain (x, min, max) {
    return Math.min(Math.max(x, min), max)
  }

  function calcTranslate (loc) {
    if (loc) {
      const x = (-1) * loc.x + (state.screen.x / 2) - 25
      const y = (-1) * loc.y + (state.screen.y / 2) - 25
      return {x, y}
    } else {
      return {x: 0, y: 0}
    }
  }

  function isInFourth (loc) {
    let display
    let edge = {}
    if (loc) {
      display = {
        x: loc.x + state.translate.x,
        y: loc.y + state.translate.y
      }
    } else {
      display = {x: 0, y: 0}
    }

    edge.w = state.screen.x / 6
    edge.h = state.screen.y / 6
    if ((display.x < edge.w) || (display.x > (state.screen.x - edge.w)))
      return true
    if ((display.y < edge.h) || (display.y > (state.screen.y - edge.h)))
      return true
    return false
  }
}

