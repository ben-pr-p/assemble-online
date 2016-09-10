import request from './request'

const prefix = '/session'

exports.get = function (room) {
  return new Promise((resolve, reject) => {
    request
      .get(prefix + `/${room}`)
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}

/*
exports.create = function (body) {
  return new Promise((resolve, reject) => {
    request
      .post(prefix + '/create')
      .send(body)
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}

exports.edit = function (id, body) {
  return new Promise((resolve, reject) => {
    request
      .post(prefix + `/${id}/edit`)
      .send(body)
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}
*/
