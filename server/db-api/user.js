'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:user')
const User = mongoose.model('User')

exports.ensure = function (user, fn) {
  User
  .findById(user.id)
  .exec((err, u) => {
    if (err) return log(err), fn(err)
    if (!u) return create(user, fn)

    return edit(u, user, fn)
  })
}

function create (user, fn) {
  const u = new User(user)
  u.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, u)
  })
}

function edit (obj, edits, fn) {
  for (let prop in edits) {
    if (prop != '_id')
      obj[prop] = edits[prop]
  }

  obj.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, obj)
  })
}

