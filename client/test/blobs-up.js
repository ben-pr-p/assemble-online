/*global chromeA chromeB chromeC expect browser*/

const bs = new Array(global.numBrowsers)
  .fill(null)
  .map(n => eval(`chrome${String.fromCharCode(n + 65)}`))

describe('room should load', function () {
  it('should have #main-app', function () {
    browser.waitForVisible('#main-app')
    expect([...new Set(Object.values(browser.getTagName('#main-app')))][0])
      .to.equal('div')
  })
})

describe('after A, B, and C do profile, 3 blobs should exist', function () {
  it('#name field should exist', function () {
    expect([...new Set(Object.values(browser.getTagName('#name')))][0])
      .to.equal('input')
  })

  describe('A, B, C should do profile', function () {
    before(function () {
      bs.forEach((b, idx) => {
        b.setValue('#name', `chrome${idx}`)
      })

      browser.click('.submit')
      browser.waitForVisible('.user-blob')
    })


    it('all should see 3 blobs', function () {
      const eachTagNames = browser.getTagName('.user-blob')
      for (let b in eachTagNames) {
        expect(eachTagNames[b]).to.have.length(bs.length)
      }
    })
  })
})
