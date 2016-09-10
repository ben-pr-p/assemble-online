import request from './request'

const prefix = '/action'

exports.all = function () {
  return new Promise((resolve, reject) => {
    request
      .get(prefix + '/all')
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}

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

exports.assign = function (id, assignee) {
  return new Promise((resolve, reject) => {
    request
      .post(prefix + `/${id}/assign`)
      .send({assignee})
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}

exports.delete = function (id) {
  return new Promise((resolve, reject) => {
    request
      .delete(prefix + `/${id}`)
      .end((err, res) => {
        if (err) return reject(err)

        return resolve(res.body)
      })
  })
}
