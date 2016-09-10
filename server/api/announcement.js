'use strict'

const express = require('express')
const app = express()

/**
 * Get
 */
app.get('/all', function (req, res) {

})

/**
 * Create
 */
app.post('/create', function (req, res) {

})

/**
 * Perform edit
 */
app.post('/:id', function (req, res) {

})

/**
 * Perform response
 */
app.post('/:id/respond', function (req, res) {

}

/**
 * Perform delete
 */
app.delete('/:id', function (req, res) {

}

module.exports = app
