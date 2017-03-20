/* Should be run with NUM_BROWSERS=2 */

describe('video', () => {
  it('expect no video transmission', () => {
    const stats = chromeA.getStats(5000)
    expect(Object.keys(stats.max.video)).to.have.length(0)
  })

  it('B should be able to turn on video', () => {
    chromeB.click('.me')
    chromeB.click('#mute')

    browser.pause(5000)
  })
  //
  // it('A\'s received audio level should now be 0', () => {
  //   const stats = chromeA.getStats(5000)
  //   expect(stats.max.audio.inbound.outputLevel).to.equal(0)
  // })
})
