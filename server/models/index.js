'use strict'

const mongoose = require('mongoose')
const log = require('debug')('assemble:db-setup')

/*
 * Get MONGOLAB_URI or use localhost
 */

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
MONGODB_URI += '/assemble'

const models = 'user announcement action-item session'.split(' ')

/*
 * Start the connection and load the models
 */

module.exports = function (app) {
  log('Connecting to MONGO on URI %s', MONGODB_URI)
  mongoose.connect(MONGODB_URI)
  models.forEach(m => {
    require(`./${m}.js`)(mongoose.connection)
  })
}
