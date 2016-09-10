'use strict'

const express = require('express')
const app = express()

const apisToExpose = 'bug-report'.split(' ') // action-item user'
apisToExpose.forEach(api => {
  app.use('/' + api, require('./' + api))
})

module.exports = app
