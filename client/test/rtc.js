/*global chromeA chromeB chromeC expect browser*/

const bs = []
if (typeof chromeA !== 'undefined') bs.push(chromeA)
if (typeof chromeB !== 'undefined') bs.push(chromeB)
if (typeof chromeC !== 'undefined') bs.push(chromeC)

describe('some property of the stats', () => {
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
    expect(stats.max.audio).to.have.property('inputLevel')
  })
})
