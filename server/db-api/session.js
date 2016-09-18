'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:session')
const announcementApi = require('./announcement')
const Session = mongoose.model('Session')

exports.create = function (session, fn) {
  const s = new Session(session)
  s.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, s)
  })
}

exports.get = function (sId, fn) {
  Session
    .findById(sId)
    .select('room agenda actionItems announcements beginning end appearances activeAgendaItem')
    .populate('agenda actionItems announcements appearances')
    .exec((err, session) => {
      if (err) return log(err), fn(err)
      if (!session) return log('No session found with id %s', sId), fn(null)

      log('Found session %s', session._id)
      return fn(null, session)
    })
}

exports.end = function (sId, fn) {
  Session
    .findById(sId)
    .exec((err, session) => {
      if (err) return log(err), fn(err)
      if (!session) return log('Cannot not end session that does not exist with id %s', sId), fn(null)

      session.end = Date.now()
      session.save(err => {
        if (err) return log(err), fn(err)

        log('Ended session with id %s', sId)
        return fn(null, session)
      })
    })
}

exports.addActionItem = function (sId, actionItem) {
  Session
    .findById(sId)
    .select('actionItems')
    .exec((err, session) => {
      if (err) return log(err), fn(err)

      actionApi.create(actionItem, (err, act) => {
        if (err) return log(err), fn(err)

        s.actionItems.push(act._id)
        s.save(err => {
          if (err) return log(err), fn(err)

          return log('Created and registered new actenda item %s for session %s', act._id, session._id), fn(null, act)
        })
      })
    })
}

exports.addAnnouncement = function (sId, announcement) {
  Session
    .findById(sId)
    .select('announcements')
    .exec((err, session) => {
      if (err) return log(err), fn(err)

      announcementApi.create(announcement, (err, a) => {
        if (err) return log(err), fn(err)

        s.announcements.push(a._id)
        s.save(err => {
          if (err) return log(err), fn(err)

          return log('Created and registered new aenda item %s for session %s', a._id, session._id), fn(null, a)
        })
      })
    })
}

exports.advanceAgenda = function (sId, fn) {
  const query = {_id: sId}
  const operation = {$inc: {activeAgendaItem: 1}}
  const options = {}

  Session
  .update(query, operation, options, (err, result) => {
    if (err) return log(err), fn(err)

    log('Incremented activeAgendaItem for session %s', sId)
    return exports.get(sId, fn)
  })
}

exports.registerUserEnter = function (sId, userId, fn) {
  Session
    .findById(sId)
    .select('appearances')
    .populate('appearances')
    .exec((err, session) => {
      if (err) return log(err), fn(err)

      session.appearances.push({user: userId, entrace: Date.now()})
      session.save(err => {
        if (err) return log(err), fn(err)

        return log('Saved user %s entrace to session %s', userId, sId), fn(null, session)
      })
    })
}

exports.registerUserExit = function (sId, userId, fn) {
  Session
    .findById(sId)
    .select('appearances')
    .populate('appearances')
    .exec((err, session) => {
      if (err) return log(err), fn(err)

      let existingIdx = null
      session.appearances.forEach((app, idx) => {
        if (app.user == userId && app.exit == null)
          existingIdx = idx
      })

      if (existingIdx == null)
        return log('User %s entrace either not found or already exited session %s', sId), fn(null)

      session.appearances[existingIdx].exit = Date.now()
      session.markModified('appearances')

      session.save(err => {
        if (err) return log(err), fn(err)

        log('Successfully registered %s exiting %s', userId, sId)
        return fn(null, session)
      })
    })
}

