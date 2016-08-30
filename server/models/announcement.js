'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * Response Schema
 */
const ResponseSchema = new Schema({
  user: {type: ObjectId, ref: 'User'},
  date: {type: Date, required: true },
  userAvatar: {type: String, required: false},
  userName: {type: String, required: true},
  reason: {type: String, required: true}
})

/**
 * Announcement Schema
 */
const AnnouncementSchema = new Schema({
  author: {type: ObjectId, ref: 'User'},
  text: {type: String, required: true },
  feedOptions: {type: Boolean, default: false },
  feedback: {type: Boolean, default: false },
  responses: [{type: ResponseSchema}],
  authorAvatar: {type: String, required: false},
  authorName: {type: String, required: true},
})

AnnouncementSchema.set('toObject', {getters: true, virtuals: true})
AnnouncementSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('Announcement', AnnouncementSchema)
}
