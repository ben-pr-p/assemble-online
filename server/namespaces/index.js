const bindEvents = require('./bind-events')

module.exports = server => ({
  has: room =>
    server.nsps[room] !== undefined
  ,

  create: room =>
    bindEvents(server, server.of(room), room)
  ,

  destroy: room => (
    namespaces[room].implode(),
    delete namespaces[room],
    delete server.nsps[room]
  )
})
