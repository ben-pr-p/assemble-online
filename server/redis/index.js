const log = require('debug')('assemble:redis')
const client = require('./client')
const gc = require('./gc')

const {
  sortbine,
  objectify,
  keyify,
  callbackify,
  distance,
  array,
  print
} = require('../utils')

module.exports = {
  rooms: {
    getAll: () =>
      new Promise((resolve, reject) =>
        client.smembers('rooms', callbackify(resolve, reject))
      ),
    size: () =>
      new Promise((resolve, reject) =>
        client.scard('rooms', callbackify(resolve, reject))
      ),
    add: room =>
      new Promise((resolve, reject) =>
        client.sadd('rooms', room, callbackify(resolve, reject))
      ),
    remove: room =>
      Promise.all([
        new Promise((resolve, reject) =>
          client.srem('rooms', room, callbackify(resolve, reject))
        ),
        gc.room(room)
      ])
  },

  room: room => ({
    name: () => room,

    users: {
      getAll: () =>
        new Promise((resolve, reject) =>
          client.smembers(`${room}:users`, (err, uids) =>
            uids
              .map(keyify('users'))
              .reduce((acc, uid) => acc.hgetall(uid), client.multi())
              .exec(callbackify(resolve, reject))
          )
        ),

      add: (uid, user) =>
        new Promise((resolve, reject) => {
          const key = keyify('users')(uid)

          client.hgetall(
            key,
            (err, existing) =>
              err
                ? reject(err)
                : client
                    .multi()
                    .sadd(`${room}:users`, uid)
                    .hmset(
                      key,
                      existing
                        ? Object.assign(user, { color: existing.color })
                        : user
                    )
                    .exec(callbackify(resolve, reject))
          )
        }),

      size: () =>
        new Promise((resolve, reject) =>
          client.scard(`${room}:users`, callbackify(resolve, reject))
        ),

      remove: uid => gc.user(room, uid)
    },

    locations: {
      get: uids =>
        Array.isArray(uids)
          ? new Promise((resolve, reject) =>
              client.mget(
                uids.map(keyify('loc')),
                (err, locs) =>
                  err ? reject(err) : resolve(objectify(uids, locs))
              )
            )
          : new Promise((resolve, reject) =>
              client.get(
                keyify('loc')(uids),
                (err, loc) => (err ? reject(err) : resolve(JSON.parse(loc)))
              )
            ),
      getAll: () =>
        new Promise((resolve, reject) =>
          client.smembers(
            `${room}:users`,
            (err, uids) =>
              uids.length > 0
                ? client.mget(
                    uids.map(keyify('loc')),
                    (err, locs) =>
                      err ? reject(err) : resolve(objectify(uids, locs))
                  )
                : {}
          )
        ),

      set: (uid, loc) =>
        new Promise((resolve, reject) => {
          const key = keyify('loc')(uid)

          client
            .multi()
            .set(key, JSON.stringify(loc))
            .exec(callbackify(resolve, reject))
        })
    },

    volumes: {
      set: (uid, vol) =>
        new Promise((resolve, reject) => {
          const key = keyify('vol')(uid)

          client.multi().set(key, vol).exec(callbackify(resolve, reject))
        }),

      getAll: () =>
        new Promise((resolve, reject) =>
          client.smembers(
            `${room}:users`,
            (err, uids) =>
              uids.length > 0
                ? client.mget(
                    uids.map(keyify('vol')),
                    (err, vols) =>
                      err ? reject(err) : resolve(objectify(uids, vols))
                  )
                : {}
          )
        ),

      get: uids =>
        new Promise((resolve, reject) =>
          client.mget(
            uids.map(keyify('vol')),
            (err, vols) => (err ? reject(err) : resolve(objectify(uids, vols)))
          )
        )
    },

    conns: {
      set: (uid, data) =>
        new Promise((resolve, reject) => {
          const key = keyify('conn')(uid)

          client
            .multi()
            .set(key, JSON.stringify(data))
            .exec(callbackify(resolve, reject))
        }),

      getAll: () =>
        new Promise((resolve, reject) =>
          client.smembers(
            `${room}:users`,
            (err, uids) =>
              uids.length > 0
                ? client.mget(
                    uids.map(keyify('conn')),
                    (err, conns) =>
                      err ? reject(err) : resolve(objectify(uids, conns))
                  )
                : {}
          )
        ),

      get: uids =>
        new Promise((resolve, reject) =>
          client.mget(
            uids.map(keyify('conns')),
            (err, conns) =>
              err ? reject(err) : resolve(objectify(uids, conns))
          )
        )
    },

    attenuations: {
      set: (uid1, uid2, val) =>
        new Promise((resolve, reject) => {
          const key = keyify('att')(sortbine(uid1)(uid2))

          client.multi().set(key, val).exec(callbackify(resolve, reject))
        })
    },

    checkpoints: {
      getAll: () =>
        new Promise((resolve, reject) =>
          client.smembers(`${room}:checks`, (err, cids) =>
            cids
              .map(keyify('checks'))
              .reduce((acc, cid) => acc.hgetall(cid), client.multi())
              .exec(
                (err, cps) =>
                  err
                    ? reject(err)
                    : resolve(
                        cps.map(cp => ({
                          id: cp.id,
                          name: cp.name,
                          color: cp.color,
                          members: JSON.parse(cp.members),
                          loc: JSON.parse(cp.loc)
                        }))
                      )
              )
          )
        ),

      add: (cid, check) =>
        new Promise((resolve, reject) => {
          const toCreate = {
            id: cid,
            name: check.name,
            color: check.color,
            loc: JSON.stringify(check.loc),
            members: JSON.stringify([])
          }

          client
            .multi()
            .sadd(`${room}:checks`, cid)
            .hmset(keyify('checks')(cid), toCreate)
            .exec((err, result) => (err ? reject(err) : resolve(toCreate)))
        }),

      moveTo: (cid, loc) =>
        new Promise((resolve, reject) =>
          client
            .multi()
            .hset(keyify('checks')(cid), 'loc', JSON.stringify(loc))
            .exec(callbackify(resolve, reject))
        ),

      setMembers: (cid, members) =>
        new Promise((resolve, reject) => {
          client
            .multi()
            .hset(keyify('checks')(cid), 'members', JSON.stringify(members))
            .exec(callbackify(resolve, reject))
        }),

      set: (cid, check) =>
        new Promise((resolve, reject) =>
          client
            .multi()
            .hmset(keyify('checks')(cid), {
              name: check.name
            })
            .exec(callbackify(resolve, reject))
        ),

      get: cid =>
        new Promise((resolve, reject) => {
          client.hgetall(
            keyify('checks')(cid),
            (err, cp) =>
              err
                ? reject(err)
                : resolve({
                  id: cp.id,
                  name: cp.name,
                  color: cp.color,
                  members: JSON.parse(cp.members),
                  loc: JSON.parse(cp.loc)
                })
          )
        }),

      user: uid => ({
        join: cid =>
          new Promise((resolve, reject) => {
            const key = keyify('checks')(cid)

            client.hget(
              key,
              'members',
              (err, members) =>
                err
                  ? reject(err)
                  : client.hset(
                      key,
                      'members',
                      JSON.stringify(array.add(JSON.parse(members), uid)),
                      callbackify(resolve, reject)
                    )
            )
          }),

        leave: cid =>
          new Promise((resolve, reject) => {
            const key = keyify('checks')(cid)
            client.hget(
              key,
              'members',
              (err, members) =>
                err
                  ? reject(err)
                  : client.hset(
                      key,
                      'members',
                      JSON.stringify(array.delete(JSON.parse(members), uid)),
                      callbackify(resolve, reject)
                    )
            )
          })
      }),

      remove: cid => gc.check(room, cid)
    },

    updates: {
      for: uid =>
        new Promise((resolve, reject) =>
          client.smembers(`${room}:users`, (err, uids) => {
            let delayed = client
              .multi()
              .mget(uids.map(keyify('loc')))
              .mget(uids.map(keyify('vol')))

            const withoutMe = uids.filter(u => u != uid)
            const attQuery = withoutMe
              .map(sortbine(uid))
              .filter(sbnd => sbnd)
              .map(keyify('att'))

            if (attQuery.length > 0) delayed = delayed.mget(attQuery)

            delayed.exec(
              (err, all) =>
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
    },

    broadcasting: {
      set: data =>
        new Promise((resolve, reject) =>
          client.set(
            `${room}:broadcasting`,
            JSON.stringify(data),
            callbackify(resolve, reject)
          )
        ),

      get: () =>
        new Promise((resolve, reject) =>
          client.get(
            `${room}:broadcasting`,
            (err, result) => (err ? reject(err) : resolve(JSON.parse(result)))
          )
        ),

      clear: () =>
        new Promise((resolve, reject) =>
          client.del(`${room}:broadcasting`, callbackify(resolve, reject))
        )
    }
  }),

  clearAll: () =>
    new Promise((resolve, reject) =>
      client.flushall(callbackify(resolve, reject))
    )
}
