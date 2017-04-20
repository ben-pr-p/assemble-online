module.exports = (obj, fn) =>
  Object.keys(obj)
  .filter(key => fn(obj[key]))
  .reduce((acc, key) =>
    Object.assign(acc, { [key]: obj[key] })
  , {})
