'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * AgendaItem Schema
 */
const AgendaItemSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  order: {type: Number, required: true},
  announcements: [{type: ObjectId, ref: 'Announcement'}],
  actionItems: [{type: ObjectId, ref: 'ActionItem'}]
})

AgendaItemSchema.set('toObject', {getters: true, virtuals: true})
AgendaItemSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('AgendaItem', AgendaItemSchema)
}
