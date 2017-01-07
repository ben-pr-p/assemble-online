const expect = require('chai').expect
const randomString = require('random-string')
const io = require('socket.io-client')

const expectNumUsersAfter = (num, after, done) =>
  setTimeout(() => {
    socks.forEach(s =>
      expect(Object.keys(s.users)).to.have.length(num)
    )
    done()
  }, after)

describe('enter and exit', () => {
  it('after /user/new, user count should be NUM_PARTICIPANTS', done => {
    socks.forEach((s, idx) => {
      s.me = {
        id: randomString({numeric: false}),
        name: `user ${idx}`
      }

      s.emit('me', s.me)
    })

    expectNumUsersAfter(NUM_PARTICIPANTS, 100, done)
  })
})

describe('half exodus and re-entry', () => {
  let dumpedUsers

  it('after half of the socks leave, user count should be NUM_PARTICIPANTS / 2', done => {
    dumpedUsers = socks.slice(0, 5).map(s => s.me)

    socks.slice(0, NUM_PARTICIPANTS / 2).forEach(s => {
      s.disconnect()
    })

    expectNumUsersAfter(NUM_PARTICIPANTS / 2, 1000, done)
  })

  it('when those half return, user count should be NUM_PARTICIPANTS', done => {
    socks = new Array(NUM_PARTICIPANTS / 2).fill(null)
      .map(idx => {
        const s = io.connect(GET_ROOM_URL('test'), SOCKET_OPTIONS)
        s.me = dumpedUsers[idx]
        s.on('connect', _ =>
          s.emit('me', s.me)
        )
        return s
      })
      .concat(socks.slice(NUM_PARTICIPANTS / 2))

    expectNumUsersAfter(NUM_PARTICIPANTS, 100, done)
  })
})
