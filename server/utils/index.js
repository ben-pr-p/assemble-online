module.exports =
  'callbackify keyify objectify sortbine distance'
  .split(' ')
  .reduce((acc, curr) =>
    Object.assign(acc, {[curr]: require(`./${curr}`)})
  , {})
