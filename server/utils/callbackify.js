module.exports = (resolve, reject) => (err, result) =>
  (err ? reject(err) : resolve(result))
