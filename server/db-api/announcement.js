'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:announcement')
const Announcement = mongoose.model('Announcement')

const editableProps = 'title description order'

exports.create = function (announcement, fn) {
  const a = new Announcement(announcement)
  a.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, ai)
  })
}

exports.edit = function (aId, announcement, fn) {
  Announcement
    .findById(aId)
    .select(editableProps)
    .exec((err, a) => {
      if (err) return log(err), fn(err)
      if (!a) return log('Cannot edit nonexistent announcement %s', aId), fn(null)

      editableProps.split(' ').forEach(prop => {
        if (announcement[prop])
          a[prop] = announcement[prop]
      })

      a.save(err => {
        if (err) return log(err), fn(err)

        log('Edited announcement %s', aId)
        return fn(null, a)
      })
    })
}

exports.addResponse = function (aId, response, fn) {
  Announcement
    .findById(aId)
    .select('responses')
    .populate('responses')
    .exec((err, a) => {
      if (err) return log(err), fn(err)
      if (!a) return log('Cannot add response to nonexistent announcement %s', aId), fn(null)

      /*
       * To Do: check if duplicate of user
       */
      a.announcements.push(response)
      a.save(err => {
        if (err) return log(err), fn(err)

        log('Added response %j to announcement %s', response, aId)
        return fn(null, a)
      })
    })
}

