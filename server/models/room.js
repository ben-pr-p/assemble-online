'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

/**
 * Room Schema
 */
const RoomSchema = new Schema({
  name: {type: String, required: true},
  sessions: [{type: ObjectId, ref: 'Session'}]
})

RoomSchema.set('toObject', {getters: true, virtuals: true})
RoomSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('Room', RoomSchema)
}
