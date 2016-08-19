/**
 * Module dependencies.
 */

var mongoose = require('mongoose')

var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId

/**
 * User Schema
 */

var UserSchema = new Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: null }
})

UserSchema.set('toObject', {getters: true, virtuals: true})
UserSchema.set('toJSON', {getters: true, virtuals: true})

module.exports = function initialize (conn) {
  return conn.model('User', UserSchema)
}
