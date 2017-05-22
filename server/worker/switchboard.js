const redis = require('../redis')
const log = require('debug')('assemble:switchboard')

const heap = (me, children, capacityFn) => {
  const numberDirectChildren = capacityFn(me).n

  return {
    [me]: children
      .slice(0, numberDirectChildren)
      .reduce(
        (acc, child, idx1) =>
          Object.assign(
            acc,
            heap(
              child,
              children
                .slice(numberDirectChildren)
                .filter((_, idx2) => (idx1 + idx2) % numberDirectChildren == 0)
            )
          ),
        {}
      )
  }
}

const calc = (data) =>
  new Promise((resolve, reject) => {
    const { broadcaster, room } = data
    const client = redis.room(room)

    Promise.all([client.users.getAll(), client.conns.getAll()])
      .then(([origUsers, conns]) => {
        // TODO – Test different capacity / bandwidth functions
        const capacityFn = uid => {
          const avg = (conns[uid].download.mean + conns[uid].upload.mean) / 2
          return {
            raw: avg,
            n: Math.floor(avg / 60) // test
          }
        }

        // Extract the broadcaster, sort the other users by bandwidth
        const users = origUsers
          .map(u => u.id).filter(id => id != broadcaster)
          .sort((a,b) => capacityFn(a).raw - capacityFn(b).raw)

        return resolve(heap(broadcaster, users, capacityFn))
      })
      .catch(reject)
  })

module.exports = { calc }
