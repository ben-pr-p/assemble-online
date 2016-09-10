import request from 'superagent'
import store from 'store'

const proto = request.Request.prototype
const end = proto.end

/**
 * Wrapper of `request.end`
 */

proto.end = function (fn) {
  let req = this
  fn = fn || function () {}

  // Accept only json on requests
  req.set('Accept', 'application/json')
  req.set('X-Access-Token', store.get('token'))

  // if `GET`, set random query parameter
  // to avoid browser caching
  if (req.method === 'GET') req.query({ random: Math.random() })

  return end.call(req, function (err, res) {
    if (err && err.status === 403) store.clear()

    return fn(err, res)
  })
}

export default request
