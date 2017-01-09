module.exports =
  'callbackify keyify objectify sortbine distance print'
  .split(' ')
  .reduce((acc, curr) =>
    Object.assign(acc, {[curr]: require(`./${curr}`)})
  , {})
