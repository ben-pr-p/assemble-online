const bindEvents = require('./bind-events')
const log = require('debug')('assemble:namespaces')

module.exports = server => ({
  has: room => {
    return server.nsps['/' + room] !== undefined
  },

  create: room =>
    bindEvents(server, server.of(room), room)
  ,

  destroy: room => (
    namespaces[room].implode(),
    delete namespaces[room],
    delete server.nsps[room]
  )
})
