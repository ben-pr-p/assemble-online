const expect = require('chai').expect

const objSort = (a, b) => a.x - b.x

const locations = new Array(NUM_PARTICIPANTS).fill(null).map(_ => ({
  x: Math.random() * 1000,
  y: Math.random() * 1000
})).sort(objSort)

const volumes = new Array(NUM_PARTICIPANTS).fill(null).map(_ => Math.random() * 30).sort()

describe('updates with attenuations', () => {
  before(() => {
    socks.forEach(s => s.on('update', update => s.lastUpdate = update))
    socks.forEach((s, idx) => {
      s.emit('volume', volumes[idx])
      s.emit('location', locations[idx])
    })
  })

  it('after receiving an update, volumes and locations should match', done => {
    setTimeout(() => {
      socks.forEach(s => {
        const [locs, vols, atts] = s.lastUpdate
        expect(Object.values(locs).sort(objSort)).to.deep.equal(locations.sort(objSort))
        expect(Object.values(vols).sort()).to.deep.equal(volumes.sort())
      })
      done()
    }, 500)
  })
})
