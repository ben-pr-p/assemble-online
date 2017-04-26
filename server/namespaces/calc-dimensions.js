module.exports = numUsers => ([
  Math.max(800, 400 * Math.ceil(numUsers / 2)),
  Math.max(600, 300 * Math.ceil(numUsers / 2))
])
