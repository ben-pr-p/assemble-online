const _objectify = (keys, vals) => vals.reduce((acc, val, idx) =>
  val
    ? Object.assign(acc, {[keys[idx]]: JSON.parse(val)})
    : acc
, {})

module.exports = (keys, vals) =>
  vals !== undefined
    ? _objectify(keys, vals)
    : curriedVals => _objectify(keys, curriedVals)
