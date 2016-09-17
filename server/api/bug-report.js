'use strict'

const express = require('express')
const log = require('debug')('assemble:helpers:github')
const app = express()

const github = require('../helpers/github')

app.post('/', function (req, res) {
  log('Request POST /bug-report with bug %j', req.body)
  github.issue(req.body)
  res.sendStatus(200)
})

module.exports = app
