module.exports = numUsers => ([
  400 * Math.ceil(numUsers / 2),
  300 * Math.ceil(numUsers / 2)
])
