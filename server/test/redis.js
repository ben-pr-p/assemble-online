const redis = require('../redis')
const expect = require('chai').expect

const testRoomName = 'hamburgar#sauce'
const testUsers = [
  {
    abc: {
      name: 'ABC',
      height: 'pretty tall'
    },
  },
  {
    def: {
      name: 'DEF',
      height: 'wee little guy'
    }
  }
]

describe('room', () => {
  it('after inserting a room, there should be 1 room', done => {
    redis.rooms.add(testRoomName)
    .then(numAdded => {
      redis.rooms.size()
      .then(size => {
        expect(size).to.equal(1)
        done()
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
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
    Promise.all(
      testUsers.map(u => {
        const uid = Object.keys(u)[0]
        return room.users.add(uid, u[uid])
      })
    )
    .then(numAddedArray => {
      room.users.getAll()
      .then(users => {
        expect(users).to.deep.equal(testUsers)
        done()
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
  })

  it('after removing the first, expect fetch to have only the second', done => {
    room.users.remove(Object.keys(testUsers[0])[0])
    .then(numRemoved => {
      room.users.getAll()
      .then(users => {
        expect(users).to.deep.equal(testUsers.slice(1))
        done()
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
  })

  it('after removing the second, expect the size to be 0', done => {
    room.users.remove(Object.keys(testUsers[1])[0])
    .then(numRemoved => {
      room.users.size()
      .then(size => {
        expect(size).to.equal(0)
        done()
      })
      .catch(err => done(err))
    })
    .catch(err => done(err))
  })
})

describe('locations', () => {
  
})
