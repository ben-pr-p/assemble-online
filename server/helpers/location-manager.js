'use strict'

const log = require('debug')('assemble:location-manager')
const crypto = require('crypto')

function hash (keys) {
  return crypto.createHash('md5').update(keys[0]).update(keys[1]).digest('hex')
}

function key(id1, id2) {
  return hash([id1, id2].sort())
}

function distance(u1, u2) {
  return Math.sqrt(Math.pow(u2.y - u1.y, 2) + Math.pow(u2.x - u1.x, 2))
}

class LocationManager {
  constructor () {
    this.users = new Set()
    this.locations = new Map()
    this.distancePairs = new Map()
  }

  handleLocationUpdate (uid1, loc) {
    this.locations.set(uid1, loc)
    this.users.add(uid1)
    this.users.forEach(uid2 => {
      this.distancePairs[key(uid1, uid2)] = distance(this.locations.get(uid1), this.locations.get(uid2))
    })
  }

  distancesFor (uid1) {
    const result = {}
    this.users.forEach(uid2 => {
      if (uid1 != uid2) {
        result[uid2] = this.distancePairs[key(uid1, uid2)]
      }
    })
    return result
  }

  removeUser (uid) {
    this.users.forEach(u => {
      this.distancePairs.delete(key(u, uid))
    })
    this.users.delete(uid)
    this.locations.delete(uid)
  }

  getLocations () {
    return [...this.locations]
  }
}

module.exports = new LocationManager()
