'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:agenda')
const announcementApi = require('./announcement')
const AgendaItem = mongoose.model('AgendaItem')

const editableProps = 'title description order'

exports.create = function (agendaItem, fn) {
  const ai = new AgendaItem(agendaItem)
  ai.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, ai)
  })
}

exports.edit = function (agId, agendaItem, fn) {
  AgendaItem
    .findById(agId)
    .select(editableProps)
    .exec((err, ag) => {
      if (err) return log(err), fn(err)
      if (!ag) return log('Cannot edit nonexistent agendaItem %s', agId), fn(null)

      editableProps.split(' ').forEach(prop => {
        if (agendaItem[prop])
          a[prop] = agendaItem[prop]
      })

      ag.save(err => {
        if (err) return log(err), fn(err)

        log('Edited agendaItem %s', agId)
        return fn(null, ag)
      })
    })
}

exports.addAnnouncement = function (agId, announcement, fn) {
  AgendaItem
    .findById(agId)
    .select('announcements')
    .exec((err, ag) => {
      if (err) return log(err), fn(err)
      if (!ag) return log('Cannot add announcement to nonexistent agendaItem %s', agId), fn(null)

      announcementApi.create(announcement, (err, a) => {
        if (err) return log(err), fn(err)

        ag.announcements.push(a.id)
        ag.save(err => {
          if (err) return log(err), fn(err)

          log('Added announcement %s to agendaItem %s', a.id, agId)
          return fn(null, ag)
        })
      })
    })
}

exports.addActionitem = function (agId, actionItem, fn) {
  AgendaItem
    .findById(agId)
    .select('actionItems')
    .exec((err, ag) => {
      if (err) return log(err), fn(err)
      if (!ag) return log('Cannot add actionItem to nonexistent agendaItem %s', agId), fn(null)

      actionApi.create(actionItem, (err, act) => {
        if (err) return log(err), fn(err)

        ag.actionItems.push(act.id)
        ag.save(err => {
          if (err) return log(err), fn(err)

          log('Added actionItem %s to agendaItem %s', act.id, agId)
          return fn(null, ag)
        })
      })
    })
}

