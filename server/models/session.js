'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * Appearance Schema
 */
const AppearanceSchema = new Schema({
  user: {type: String, ref: 'User'},
  entrace: {type: Date, default: Date.now()},
  exit: {type: Date, required: false}
})

/**
 * Session Schema
 */
const SessionSchema = new Schema({
  room: {type: String, required: true},
  agenda: [{type: ObjectId, ref: 'AgendaItem'}],
  actionItems: [{type: ObjectId, ref: 'ActionItem'}],
  announcements: [{type: ObjectId, ref: 'Announcement'}],
  beginning: {type: Date, default: Date.now()},
  end: {type: Date, required: false},
  appearances: [AppearanceSchema]
})

SessionSchema.set('toObject', {getters: true, virtuals: true})
SessionSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('Session', SessionSchema)
}
