const redis = require('redis').createClient(process.env.REDIS_URL)

const callbackify =
  (resolve, reject) =>
    (err, result) =>
      err
        ? reject(err)
        : resolve(result)

const keyify = prefix => uid => `${prefix}:${uid}`
const sortbine = uid1 => uid2 =>
  uid1 != uid2
    ? [uid1, uid2].sort().join('-')
    : undefined

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
      getAllIds: () => new Promise((resolve, reject) =>
        redis.smembers(`${room}:users`, callbackify(resolve, reject))
      ),

      getAll: () => new Promise((resolve, reject) => {
        redis.smembers(`${room}:users`, (err, uids) =>
          uids.map(keyify('users')).reduce((acc, uid) =>
            acc.hgetall(uid)
          , redis.multi())
          .exec((err, replies) => err
            ? reject(err)
            : resolve(replies.map((rep, idx) => ({
                [uids[idx]]: rep
              })))
          )
        )
      }),

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
        redis.mget(uids.map(keyify('loc')), callbackify(resolve, reject))
      ),

      set: (uid, loc) => new Promise((resolve, reject) =>
        redis.set(keyify('loc')(uid), loc, callbackify(resolve, reject))
      )
    },

    volumes: {
      get: (uids) => new Promise((resolve, reject) =>
        redis.mget(uids.map(keyify('vol')), callbackify(resolve, reject))
      ),
      set: (uid, vol) => new Promise((resolve, reject) =>
        redis.set(keyify('vol')(uid), loc, callbackify(resolve, reject))
      )
    },

    attenuations: {
      getFor: (uid, others) => new Promise((resolve, reject) =>
        redis.mget(uids.map(sortbine(uid)).map(keyify('att')), callbackify(resolve, reject))
      ),
      set: (uid1, uid2, val) => new Promise((resolve, reject) =>
        redis.set(keyify('att')(sortbine(uid1)(uid2)), val, callbackify(resolve, reject))
      )
    },

    updates: {
      for: (uid) => new Promise((resolve, reject) =>
        redis.smembers(`${room}:users`, (err, uids) =>
          redis
            .multi()
            .mget(uids.map(keyify('loc')))
            .mget(uids.map(keyify('vol')))
            .mget(uids.map(sortbine(uid)).map(keyify('att')))
            .exec(callbackify(resolve, reject))
        )
      )
    }
  })
}
