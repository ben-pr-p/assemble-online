/* Should be run with NUM_BROWSERS=2 */

describe('muting', () => {
  it('expect positive non zero output level', () => {
    const stats = chromeA.getStats(5000)
    expect(stats.max.audio.inbound.outputLevel).to.be.above(0)
  })

  it('B should be able to click and mute itself', () => {
    chromeB.click('.me')
    chromeB.click('#mute')

    browser.pause(5000)
  })

  it('A\'s received audio level should now be 0', () => {
    const stats = chromeA.getStats(5000)
    expect(stats.max.audio.inbound.outputLevel).to.equal(0)
  })
})
