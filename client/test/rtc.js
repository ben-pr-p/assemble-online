/*global chromeA chromeB chromeC expect browser*/

describe('audio should transfer', () => {
  before(() => {
    chromeA.startAnalyzing()

    browser
    .pause(5000)
  })

  it('conn info', () => {
    const conn = chromeA.getConnectionInformation()
    expect(conn).to.be.a.object
    expect(conn.transport).to.equal('udp')
  })

  it('audio transfer', () => {
    const stats = chromeA.getStats(5000)
    expect(stats.max.audio.inbound).to.have.property('outputLevel')
    expect(stats.max.audio.outbound).to.have.property('inputLevel')
  })
})

require('./mute')
require('./video')
