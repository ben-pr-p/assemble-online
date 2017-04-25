const express = require('express')
const app = express()

const apps = ['bugs']
apps.forEach(a => {
  app.use(`/${a}`, require(`./${a}`))
})

module.exports = app
