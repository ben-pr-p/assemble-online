const redis = require('redis').createClient(process.env.REDIS_URL)
const {
  sortbine, objectify, keyify, callbackify, distance, print
} = require('../utils')

const log = require('debug')('assemble:redis')

const shortExpiry = 500
const longExpiry = 100000

module.exports = {
  rooms: {
    getAll: () => new Promise((resolve, reject) =>
      redis.smembers('rooms', callbackify(resolve, reject))
    ),
    size: () => new Promise((resolve, reject) =>
      redis.scard('rooms', callbackify(resolve, reject))
    ),
    add: (room) => new Promise((resolve, reject) =>
      redis.sadd('rooms', room, callbackify(resolve, reject))
    ),
    remove: (room) => new Promise((resolve, reject) =>
      redis.srem('rooms', room, callbackify(resolve, reject))
    )
  },

  room: (room) => ({
    name: () => room,

    users: {
      getAll: () => new Promise((resolve, reject) =>
        redis.smembers(`${room}:users`, (err, uids) =>
          uids.map(keyify('users')).reduce((acc, uid) =>
            acc.hgetall(uid)
          , redis.multi())
          .exec((err, replies) => err
            ? reject(err)
            : resolve(replies)
          )
        )
      ),

      add: (uid, user) => new Promise((resolve, reject) =>
        redis
          .multi()
          .sadd(`${room}:users`, uid)
          .hmset(keyify('users')(uid), user)
          .exec(callbackify(resolve, reject))
      ),

      size: () => new Promise((resolve, reject) =>
        redis.scard(`${room}:users`, callbackify(resolve, reject))
      ),

      remove: (uid) => new Promise((resolve, reject) =>
        redis
          .multi()
          .srem(`${room}:users`, uid)
          .del(keyify('users')(uid))
          .exec(callbackify(resolve, reject))
      ),
    },

    locations: {
      get: (uids) => new Promise((resolve, reject) =>
        redis.mget(uids.map(keyify('loc')), (err, locs) =>
          err
            ? reject(err)
            : resolve(objectify(uids, locs))
        )
      ),

      getAll: () => new Promise((resolve, reject) =>
        redis.smembers(`${room}:users`, (err, uids) =>
          uids.length > 0
            ? redis.mget(uids.map(keyify('loc')), (err, locs) =>
                err
                  ? reject(err)
                  : resolve(objectify(uids, locs))
              )
            : {}
        )
      ),

      set: (uid, loc) => new Promise((resolve, reject) => {
        const key = keyify('loc')(uid)

        redis
          .multi()
          .set(key, JSON.stringify(loc))
          .exec(callbackify(resolve, reject))
      })
    },

    volumes: {
      set: (uid, vol) => new Promise((resolve, reject) => {
        const key = keyify('vol')(uid)

        redis
          .multi()
          .set(key, vol)
          .exec(callbackify(resolve, reject))
      })
    },

    attenuations: {
      set: (uid1, uid2, val) => new Promise((resolve, reject) => {
        const key = keyify('att')(sortbine(uid1)(uid2))

        redis
          .multi()
          .set(key, val)
          .exec(callbackify(resolve, reject))
      })
    },

    checkpoints: {
      getAll: () => new Promise((resolve, reject) =>
        redis.smembers(`${room}:checks`, (err, cids) => {
          const memberKeyify = keyify('checks:members')
          const locKeyify = keyify('checks:loc')

          let chain = redis.multi()

          if (cids.length == 0) return resolve({})

          cids.forEach(cid => {
            chain = chain.smembers(memberKeyify(cid))
          })

          cids.forEach(cid => {
            chain = chain.get(locKeyify(cid))
          })

          chain.exec((err, [members, locations]) => {
            if (err) return reject(err)

            return resolve(cids.reduce((cid, idx) =>
              Object.assing({
                [cid]: {
                  members: members[idx],
                  loc: locations[idx]
                }
              })
            , {}))
          })
        })
      ),

      add: (cid, check) => new Promise((resolve, reject) =>
        redis
          .multi()
          .sadd(`${room}:checks`, cid)
          .exec(callbackify(resolve, reject))
      ),

      moveTo: (cid, loc) => new Promise((resolve, reject) =>
        redis
          .multi()
          .set(keyify('checks:loc')(cid), loc)
          .exec(callbackify(resolve, reject))
      ),

      user: uid => ({
        join: cid => new Promise((resolve, reject) =>
          redis
            .sadd(keyify('checks')(cid), uid, callbackify(resolve, reject))
        ),

        leave: cid => new Promise((resolve, reject) =>
          redis
            .srem(keyify('checks')(cid), uid, callbackify(resolve, reject))
        )
      }),

      remove: (cid) => new Promise((resolve, reject) =>
        redis
          .multi()
          .srem(`${room}:checks`, cid)
          .del(keyify('checks')(cid))
          .exec(callbackify(resolve, reject))
      ),
    },

    updates: {
      for: (uid) => new Promise((resolve, reject) =>
        redis.smembers(`${room}:users`, (err, uids) => {
          let queued = redis.multi()
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
