'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:action')
const ActionItem = mongoose.model('ActionItem')

const editableProps = 'title description order dueDate'

exports.create = function (actionItem, fn) {
  const ai = new ActionItem(actionItem)
  ai.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, ai)
  })
}

exports.edit = function (acId, actionItem, fn) {
  ActionItem
    .findById(acId)
    .select(editableProps)
    .exec((err, ac) => {
      if (err) return log(err), fn(err)
      if (!ac) return log('Cannot edit nonexistent actionItem %s', acId), fn(null)

      editableProps.split(' ').forEach(prop => {
        if (actionItem[prop])
          ac[prop] = actionItem[prop]
      })

      ac.save(err => {
        if (err) return log(err), fn(err)

        log('Edited actionItem %s', acId)
        return fn(null, ac)
      })
    })
}

exports.addAssignee = function (acId, userId, fn) {
  ActionItem
    .findById(acId)
    .select('assignees')
    .populate('assignees')
    .exec((err, ac) => {
      if (err) return log(err), fn(err)
      if (!ac) return log('Cannot add assignee to nonexistent actionItem %s', acId), fn(null)

      ac.assignees.push(userId)
      ac.save(err => {
        if (err) return log(err), fn(err)

        log('Added assignee %s to actionItem %s', userId, acId)
        return fn(null, ac)
      })
    })
}
