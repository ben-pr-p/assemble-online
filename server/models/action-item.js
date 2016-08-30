'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * ActionItem Schema
 */
const ActionItemSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  order: {type: Number, required: true},
  dueDate: {type: Date, required: true},
  assignees: [{type: ObjectId, ref: 'User'}]
})

ActionItemSchema.set('toObject', {getters: true, virtuals: true})
ActionItemSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('ActionItem', ActionItemSchema)
}

