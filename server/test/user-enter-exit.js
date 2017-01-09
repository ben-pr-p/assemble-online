const expect = require('chai').expect
const randomString = require('random-string')
const io = require('socket.io-client')

const print = s => {console.log(s); return s}

const expectNumUsersAfter = (num, after, done) =>
  setTimeout(() => {
    socks.slice(5).forEach(s =>
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

    expectNumUsersAfter(NUM_PARTICIPANTS, TIMEOUT, done)
  })
})

describe('half exodus and re-entry', () => {
  let dumpedUsers

  it('after half of the socks leave, user count should be NUM_PARTICIPANTS / 2', done => {
    dumpedUsers = socks.slice(0, NUM_PARTICIPANTS / 2).map(s => s.me)

    socks.slice(0, NUM_PARTICIPANTS / 2).forEach(s => {
      s.disconnect()
    })

    expectNumUsersAfter(NUM_PARTICIPANTS / 2, TIMEOUT, done)
  })

  it('when those half return, user count should be NUM_PARTICIPANTS', done => {
    socks = dumpedUsers
      .map(aMe => {
        const s = io.connect(GET_ROOM_URL('test'), SOCKET_OPTIONS)
        s.on('connect', _ =>
          s.emit('me', aMe)
        )
        return s
      })
      .concat(socks.slice(NUM_PARTICIPANTS / 2))

    expectNumUsersAfter(NUM_PARTICIPANTS, TIMEOUT + 100, done)
  })
})
