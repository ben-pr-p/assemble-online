const Emitter = require('events')
const redis = require('redis')
const log = require('debug')('assemble:redis')

const client = require('./client')
const gc = require('./gc')
const subscriber = redis.createClient(process.env.REDIS_URL)
const publisher = redis.createClient(process.env.REDIS_URL)

const {
  sortbine, objectify, keyify, callbackify, distance, array, print
} = require('../utils')

const emitter = new Emitter()

/*
 * TODO - only happens once, not for each require
 */

subscriber.on('message', (channel, raw) => {
  const {msg, data} = JSON.parse(raw)
  emitter.emit(msg, data)
})

subscriber.subscribe('channel')

module.exports = {
  emitter: {
    on: (msg, fn) => emitter.on(msg, fn),
    emit: (msg, data) => {
      log(msg)
      log(data)
      publisher.publish('channel', JSON.stringify({msg, data}))
    },
  },

  rooms: {
    getAll: () => new Promise((resolve, reject) =>
      client.smembers('rooms', callbackify(resolve, reject))
    ),
    size: () => new Promise((resolve, reject) =>
      client.scard('rooms', callbackify(resolve, reject))
    ),
    add: (room) => new Promise((resolve, reject) =>
      client.sadd('rooms', room, callbackify(resolve, reject))
    ),
    remove: (room) => new Promise((resolve, reject) =>
      client.srem('rooms', room, callbackify(resolve, reject))
    )
  },

  room: (room) => ({
    name: () => room,

    users: {
      getAll: () => new Promise((resolve, reject) =>
        client.smembers(`${room}:users`, (err, uids) =>
          uids.map(keyify('users')).reduce((acc, uid) =>
            acc.hgetall(uid)
          , client.multi())
          .exec(callbackify(resolve, reject))
        )
      ),

      add: (uid, user) => new Promise((resolve, reject) =>
        client
          .multi()
          .sadd(`${room}:users`, uid)
          .hmset(keyify('users')(uid), user)
          .exec(callbackify(resolve, reject))
      ),

      size: () => new Promise((resolve, reject) =>
        client.scard(`${room}:users`, callbackify(resolve, reject))
      ),

      remove: (uid) => gc.user(room, uid)
    },

    locations: {
      get: (uids) => Array.isArray(uids)
        ? new Promise((resolve, reject) =>
            client.mget(uids.map(keyify('loc')), (err, locs) =>
              err
                ? reject(err)
                : resolve(objectify(uids, locs))
          ))
        : new Promise((resolve, reject) =>
            client.get(keyify('loc')(uids), (err, loc) => err
              ? reject(err)
              : resolve(JSON.parse(loc))
          ))
      ,

      getAll: () => new Promise((resolve, reject) =>
        client.smembers(`${room}:users`, (err, uids) =>
          uids.length > 0
            ? client.mget(uids.map(keyify('loc')), (err, locs) =>
                err
                  ? reject(err)
                  : resolve(objectify(uids, locs))
              )
            : {}
        )
      ),

      set: (uid, loc) => new Promise((resolve, reject) => {
        const key = keyify('loc')(uid)

        client
          .multi()
          .set(key, JSON.stringify(loc))
          .exec(callbackify(resolve, reject))
      })
    },

    volumes: {
      set: (uid, vol) => new Promise((resolve, reject) => {
        const key = keyify('vol')(uid)

        client
          .multi()
          .set(key, vol)
          .exec(callbackify(resolve, reject))
      })
    },

    attenuations: {
      set: (uid1, uid2, val) => new Promise((resolve, reject) => {
        const key = keyify('att')(sortbine(uid1)(uid2))

        client
          .multi()
          .set(key, val)
          .exec(callbackify(resolve, reject))
      })
    },

    checkpoints: {
      getAll: () => new Promise((resolve, reject) =>
        client.smembers(`${room}:checks`, (err, cids) =>
          cids.map(keyify('checks')).reduce((acc, cid) =>
            acc.hgetall(cid)
          , client.multi())
          .exec((err, cps) => err
            ? reject(err)
            : resolve(cps.map(cp => ({
                id: cp.id,
                name: cp.name,
                members: JSON.parse(cp.members),
                loc: JSON.parse(cp.loc)
              })))
          )
        )
      ),

      add: (cid, check) => new Promise((resolve, reject) =>
        client
          .multi()
          .sadd(`${room}:checks`, cid)
          .hmset(keyify('checks')(cid), {
            id: cid,
            name: check.name,
            loc: JSON.stringify(check.loc),
            members: JSON.stringify([])
          })
          .exec(callbackify(resolve, reject))
      ),

      moveTo: (cid, loc) => new Promise((resolve, reject) =>
        client
          .multi()
          .hset(keyify('checks')(cid), 'loc', JSON.stringify(loc))
          .exec(callbackify(resolve, reject))
      ),

      user: uid => ({
        join: cid => new Promise((resolve, reject) => {
          const key = keyify('checks')(cid)

          client
            .hget(key, 'members', (err, members) => err
              ? reject(err)
              : client
                  .hset(
                    key,
                    'members',
                    JSON.stringify(array.add(JSON.parse(members), uid)),
                    (err, response) => {
                      if (err) return reject(err)
                      log(response)
                      resolve(response)
                    }
                    // callbackify(resolve, reject)
                  )
            )
        }),

        leave: cid => new Promise((resolve, reject) => {
          const key = keyify('checks')(cid)
          client
            .hget(key, 'members', (err, members) => err
              ? reject(err)
              : client
                  .hset(
                    key,
                    'members',
                    JSON.stringify(array.delete(JSON.parse(members), uid)),
                    callbackify(resolve, reject)
                  )
            )
        })
      }),

      remove: (cid) => gc.check(room, cid)
    },

    updates: {
      for: (uid) => new Promise((resolve, reject) =>
        client.smembers(`${room}:users`, (err, uids) => {
          let queued = client.multi()
            .mget(uids.map(keyify('loc')))
            .mget(uids.map(keyify('vol')))

          const withoutMe = uids.filter(u => u != uid)
          const attQuery = withoutMe.map(sortbine(uid)).filter(sbnd => sbnd).map(keyify('att'))

          if (attQuery.length > 0)
            queued = queued.mget(attQuery)

          queued
            .exec((err, all) =>
              err
                ? reject(err)
                : resolve([
                    objectify(uids, all[0]),
                    objectify(uids, all[1]),
                    objectify(withoutMe, all[2])
                  ])
            )
        })
      )
    }
  })
}
