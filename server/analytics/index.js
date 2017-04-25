const monk = require('monk')
const log = require('debug')('assemble:analytics')
const redis = require('../redis')
const db = monk(process.env.MONGODB_URI || 'localhost:27017/assemble')
const snapshots = db.get('snapshots')

const DEBUG = false
const RESOLUTION = 500 // ms

const snap = async roomName => {
  const room = redis.room(roomName)

  const [ users, checkpoints ] = await Promise.all([
    room.users.getAll(),
    room.checkpoints.getAll()
  ])

  const uids = users.map(u => u.id)

  const [ volumes, locations ] = await Promise.all([
    room.volumes.get(uids),
    room.locations.get(uids)
  ])

  const data = {
    checkpoints, volumes, locations,
    room: roomName,
    time: Date.now()
  }

  if (DEBUG) log('Got snapshot %j', data)
  return data
}

const snapAll = () => new Promise((resolve, reject) => {
  redis.rooms
    .getAll()
    .then(rooms => Promise.all(rooms.map(snap)))
    .then(snapshots.insert)
    .then(resolve)
    .catch(reject)
})

setInterval(snapAll, RESOLUTION)
