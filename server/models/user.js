'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * User Schema
 */

const UserSchema = new Schema({
  ip: { type: String, required: true },
  browser: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: null }
})

UserSchema.set('toObject', {getters: true, virtuals: true})
UserSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('User', UserSchema)
}
