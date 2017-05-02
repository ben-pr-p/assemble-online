const config = require('./config')
const client = require('./client')
const log = require('debug')('assemble:garbage-collection')

const {
  sortbine,
  objectify,
  keyify,
  callbackify,
  distance,
  array,
  print,
} = require('../utils')

const e = {}

e.user = (room, uid) =>
  new Promise((resolve, reject) => {
    client.smembers(`${room}:users`, (err, uids) => {
      const me = uid
      const others = uids.filter(u => u != me)

      const toDel = [
        keyify('users')(me),
        keyify('loc')(me),
        keyify('vol')(me),
      ].concat(others.map(sortbine(me)).filter(sbnd => sbnd).map(keyify('att')))

      client
        .multi()
        .srem(`${room}:users`, me)
        .del(toDel)
        .exec((err, numDeleted) => (err ? reject(err) : resolve(numDeleted)))
    })
  })

e.check = (room, cid) =>
  new Promise((resolve, reject) =>
    client
      .multi()
      .srem(`${room}:checks`, cid)
      .del(keyify('checks')(cid))
      .exec((err, numDeleted) => (err ? reject(err) : resolve(numDeleted)))
  )

e.room = room =>
  new Promise((resolve, reject) => {
    log('Garbage collecting %s', room)

    client
      .multi()
      .smembers(`${room}:users`)
      .smembers(`${room}:checks`)
      .exec((err, [uids, cids]) =>
        Promise.all(
          [].concat(
            uids.map(u => e.user(room, u)),
            cids.map(c => e.check(room, c))
          )
        )
          .then(resolve)
          .catch(reject)
      )
  })

module.exports = e
