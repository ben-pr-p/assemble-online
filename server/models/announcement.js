/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

/**
 * Response Schema
 */
var ResponseSchema = new Schema({
  date: {type: Date, required: true },
  userAvatar: {type: String, required: false},
  userName: {type: String, required: true},
  user: {type: ObjectId, ref: 'User'},
  reason: {type: String, required: true}
})

/**
 * Announcement Schema
 */
var AnnouncementSchema = new Schema({
  text: {type: String, required: true },
  feedOptions: {type: Boolean, default: false },
  feedback: {type: Boolean, default: false },
  responses: [{type: ResponseSchema}],
  author: {type: ObjectId, ref: 'User'},
  authorAvatar: {type: String, required: false},
  authorName: {type: String, required: true},
})

AnnouncementSchema.set('toObject', {getters: true, virtuals: true})
AnnouncementSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('Announcement', AnnouncementSchema)
}
