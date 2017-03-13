/*global chromeA chromeB chromeC expect browser*/

const genMessage = source => JSON.stringify({source, number: Math.random()})

const messageFromA = genMessage('A')
const messageFromB = genMessage('B')
const messageFromC = genMessage('C')

describe('A creates a checkpoint', function () {
  it('A can click menu, checkpoint, create checkpoint', function () {
    chromeA
      .click('.menu')
      .click('#Checkpoints')
      .click('#New Checkpoint')
      .click('#name', 'ChromeA Checkpoint')
      .click('.submit')

    browser.pause(300)
  })

  it('All should see checkpoint', function () {
    expect(
      browser.getTagName('.cp-drawer')
    ).to.equal('div')
  })
})

// describe('bossful propogation', function () {
//   it('A\'s state changes propogate within 30ms', function () {
//     chromeA
//       .setValue('#set-state', messageFromA)
//       .click('#do-set-state')
//
//     browser.pause(300)
//
//     expect(
//       chromeB.getText('#current-state')
//     ).to.equal(messageFromA)
//
//     expect(
//       chromeC.getText('#current-state')
//     ).to.equal(messageFromA)
//   })
//
//   it('B\'s state changes propogate within 30ms', function () {
//     chromeB
//       .setValue('#set-state', messageFromB)
//       .click('#do-set-state')
//
//     browser.pause(300)
//
//     expect(
//       chromeC.getText('#current-state')
//     ).to.equal(messageFromB)
//
//     expect(
//       chromeA.getText('#current-state')
//     ).to.equal(messageFromB)
//   })
//
//   it('C\'s state changes propogate within 30ms', function () {
//     chromeC
//       .setValue('#set-state', messageFromC)
//       .click('#do-set-state')
//
//     browser.pause(300)
//
//     expect(
//       chromeA.getText('#current-state')
//     ).to.equal(messageFromC)
//
//     expect(
//       chromeB.getText('#current-state')
//     ).to.equal(messageFromC)
//   })
// })
//
// describe('transition of power', function () {
//   it('if A navigates away, B\'s updates should still go to C', function () {
//     chromeA.url('/room/other-test')
//
//     chromeB
//       .setValue('#set-state', messageFromB)
//       .click('#do-set-state')
//
//     browser.pause(300)
//
//     expect(
//       chromeB.getText('#current-state')
//     ).to.equal(messageFromB)
//
//     expect(
//       chromeC.getText('#current-state')
//     ).to.equal(messageFromB)
//   })
//
//   it('and C\'s to B', function () {
//     chromeC
//       .setValue('#set-state', messageFromC)
//       .click('#do-set-state')
//
//     expect(
//       chromeB.getText('#current-state')
//     ).to.equal(messageFromC)
//
//     expect(
//       chromeC.getText('#current-state')
//     ).to.equal(messageFromC)
//   })
// })
//
// describe('new friends', function () {
//   it('when A returns, A should have widget with message from B', function () {
//     chromeA.url('/room/test')
//     browser.pause(300)
//
//     expect(
//       chromeA.getText('#current-state')
//     ).to.equal(messageFromB)
//   })
// })
