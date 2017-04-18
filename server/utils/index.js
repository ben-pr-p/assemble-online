module.exports =
  'callbackify keyify objectify sortbine distance print filterobj array'
  .split(' ')
  .reduce((acc, curr) =>
    Object.assign(acc, { [curr]: require(`./${curr}`) })
  , {})
