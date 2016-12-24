const genMessage = source => JSON.stringify({source, number: Math.random()})

const messageFromA = genMessage('A')
const messageFromB = genMessage('B')
const messageFromC = genMessage('C')

describe('After A creates the Test widget, A, B, and C should see it within 30ms', function () {
  it('A can click menu, widgets, test widget', function () {
    chromeA
      .click('.menu-bar')
      .click('#Widgets')
      .click('#TestSpatial')

    browser.pause(300)
  })

  it('after A creates Test, B and C see it', function () {
    expect(
      chromeB.getTagName('#widget-state')
    ).to.equal('div')

    expect(
      chromeC.getTagName('#widget-state')
    ).to.equal('div')
  })
})

describe('bossful propogation', function () {
  it('A\'s state changes propogate within 30ms', function () {
    chromeA
      .setValue('#set-state', messageFromA)
      .click('#do-set-state')

    browser.pause(300)

    expect(
      chromeB.getText('#current-state')
    ).to.equal(messageFromA)

    expect(
      chromeC.getText('#current-state')
    ).to.equal(messageFromA)
  })

  it('B\'s state changes propogate within 30ms', function () {
    chromeB
      .setValue('#set-state', messageFromB)
      .click('#do-set-state')

    browser.pause(300)

    expect(
      chromeC.getText('#current-state')
    ).to.equal(messageFromB)

    expect(
      chromeA.getText('#current-state')
    ).to.equal(messageFromB)
  })

  it('C\'s state changes propogate within 30ms', function () {
    chromeC
      .setValue('#set-state', messageFromC)
      .click('#do-set-state')

    browser.pause(300)

    expect(
      chromeA.getText('#current-state')
    ).to.equal(messageFromC)

    expect(
      chromeB.getText('#current-state')
    ).to.equal(messageFromC)
  })
})

describe('transition of power', function () {
  it('if A navigates away, B\'s updates should still go to C', function () {
    chromeA.url('/room/other-test')

    chromeB
      .setValue('#set-state', messageFromB)
      .click('#do-set-state')

    expect(
      chromeB.getText('#current-state')
    ).to.equal(messageFromB)

    expect(
      chromeC.getText('#current-state')
    ).to.equal(messageFromB)
  })
})

describe('new friends', function () {
  it('when A returns, A should have widget with message from B', function () {
    chromeA.url('/room/test')
    browser.pause(30)

    expect(
      chromeA.getText('#current-state')
    ).to.equal(messageFromB)
  })
})
