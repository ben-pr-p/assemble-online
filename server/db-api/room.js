'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:user')
const Room = mongoose.model('Room')

exports.create = function (room, fn) {
  const r = new Room(room)
  r.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, r)
  })
}

exports.get = function (rId, fn) {
  Room
    .findById(rId)
    .select('sessions')
    .populate('sessions')
    .exec((err, room) => {
      if (err) return log(err), fn(err)
      if (!room) return log('No room found with id %s', rId), fn(null)

      log('Found room %s', rId)
      return fn(null, room)
    })
}
