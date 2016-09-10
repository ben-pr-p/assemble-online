export default function (state, on, emit, socket) {
  socket.on('distances', handle)
  function handle (raw) {
    if (raw) {
      let copy = {}
      for (let uid in raw)
        copy[state.easyrtcids.get(uid)] = raw[uid]

      state.distances = copy
      for (let easyrtcid in copy)
        emit(`distance-to-${easyrtcid}`, copy[easyrtcid])
    }
  }
}
