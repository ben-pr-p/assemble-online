const crypto = require('crypto')

module.exports = function identifyUserBrowser (ip, ua) {
  return crypto.createHash('md5').update(ip).update(ua).digest('hex')
}
