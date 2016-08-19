var mongoose = require('mongoose')
var log = require('debug')('assemble:db-setup')

/*
 * Get MONGOLAB_URI or use localhost
 */

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
MONGODB_URI += '/pulse'

var models = 'user announcement'.split(' ')

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
