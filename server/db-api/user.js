'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-api:user')
const User = mongoose.model('User')

exports.create = function (user, fn) {
  const u = new User(user)
  u.save(err => {
    if (err) return log(err), fn(err)

    return fn(null, u)
  })
}
