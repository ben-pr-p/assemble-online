const redis = require('../redis')
const expect = require('chai').expect

const extract = users =>
  users.map(u => u.id).sort()

const testRoomName = 'hamburgar#sauce'
const testUsers = [{
  id: 'abc',
  name: 'ABC',
  height: 'pretty tall'
}, {
  id: 'def',
  name: 'DEF',
  height: 'wee little guy'
}]

const testLocations = {}
testUsers.forEach(u => {
  testLocations[u.id] = {x: Math.random() * 1000, y: Math.random() * 1000}
})

const testVolumes = {}
testUsers.forEach(u => {
  testVolumes[u.id] = Math.random() * 20
})

describe('room', () => {
  it('after inserting a room, there should be 1 room', done => {
    redis.rooms.add(testRoomName)
    .then(numAdded => {
      redis.rooms.size()
      .then(size => {
        expect(size).to.equal(1)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })

  it('after deleting a room, there should be 0 rooms', done => {
    redis.rooms.remove(testRoomName)
    .then(numRemoved => {
      redis.rooms.size()
      .then(size => {
        expect(size).to.equal(0)
        done()
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
  })
})

describe('users', () => {
  const room = redis.room(testRoomName)

  before(done => {
    redis.rooms.add(testRoomName)
    .then(numAdded => done())
  })

  it('after adding two users, expect fetch to have them all', done => {
    Promise.all(testUsers.map(u =>
      room.users.add(u.id, u)
    ))
    .then(numAddedArray => {
      room.users.getAll()
      .then(users => {
        expect(extract(users)).to.deep.equal(extract(users))
        done()
      })
      .catch(done)
    })
    .catch(done)
  })

  it('after removing the first, expect fetch to have only the second', done => {
    room.users.remove(testUsers[0].id)
    .then(numRemoved => {
      room.users.getAll()
      .then(users => {
        expect(extract(users)).to.deep.equal(extract(testUsers.slice(1)))
        done()
      })
      .catch(done)
    })
    .catch(done)
  })

  it('after removing the second, expect the size to be 0', done => {
    room.users.remove(testUsers[1].id)
    .then(numRemoved => {
      room.users.size()
      .then(size => {
        expect(size).to.equal(0)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })
})

describe('locations', () => {
  const room = redis.room(testRoomName)

  before(done => {
    Promise.all(testUsers.map(u =>
      room.users.add(u.id, u)
    ))
    .then(numAddedArray => done())
    .catch(done)
  })

  it('after setting locations, getting all locations should equal the inserted locations', done => {
    Promise.all(Object.keys(testLocations).map(uid =>
      room.locations.set(uid, testLocations[uid])
    ))
    .then(numAddedArray => {
      room.locations.getAll()
      .then(locs => {
        expect(locs).to.deep.equal(testLocations)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })

  it('locations should expire', done => {
    setTimeout(() =>
      room.locations.getAll()
      .then(locs => {
        expect(locs).to.deep.equal({})
        done()
      })
      .catch(done)
    , 501)
  })
})

describe('volumes', () => {
  const room = redis.room(testRoomName)

  it('after setting volumes, getting all volumes should equal the inserted volumes', done => {
    Promise.all(Object.keys(testVolumes).map(uid =>
      room.volumes.set(uid, testVolumes[uid])
    ))
    .then(numAddedArray => {
      room.volumes.getAll()
      .then(vols => {
        expect(vols).to.deep.equal(testVolumes)
        done()
      })
      .catch(done)
    })
    .catch(done)
  })

  it('volumes should expire', done => {
    setTimeout(() =>
      room.volumes.getAll()
      .then(volumes => {
        expect(volumes).to.deep.equal({})
        done()
      })
      .catch(done)
    , 501)
  })
})

describe('updates', () => {
  const room = redis.room(testRoomName)

  before(done => {
    Promise.all(Object.keys(testVolumes).map(uid =>
      room.volumes.set(uid, testVolumes[uid])
    ).concat(Object.keys(testLocations).map(uid =>
      room.locations.set(uid, testLocations[uid])
    )))
    .then(doubleNumAddedArray => {
      done()
    })
    .catch(done)
  })

  it('updates should equal locations, volumes, {}', done => {
    room.updates.for(testUsers[0].id)
    .then(([locs, vols, atts]) => {
      expect(locs).to.deep.equal(testLocations)
      expect(vols).to.deep.equal(testVolumes)
      expect(atts).to.deep.equal({})
      done()
    })
    .catch(done)
  })
})
