import request from './request'

const prefix = '/user'

exports.create = function (room) {
  return new Promise((resolve, reject) => {
    request
      .get(prefix + `/${room}`)
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}
