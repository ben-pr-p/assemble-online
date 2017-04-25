/*
 * Dependencies
 */
const log = require('debug')('assemble:bugs')
const express = require('express')
const monk = require('monk')
const db = monk(process.env.MONGODB_URI || 'localhost:27017/assemble')

const app = express()

const bugs = db.get('bugs')

app.post('/', (req, res) => {
  const { user, problem, context, userAgent } = req.body
  const bug = { user, problem, context, userAgent }

  log('Dumping bug %j', bug)

  bugs.insert(bug)
  .then(ok => res.sendStatus(200))
  .catch(res.status(400).json)
})

module.exports = app
