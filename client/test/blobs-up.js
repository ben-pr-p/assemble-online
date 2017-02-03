/*global chromeA chromeB chromeC expect browser*/

const bs = []
if (typeof chromeA !== 'undefined') bs.push(chromeA)
if (typeof chromeB !== 'undefined') bs.push(chromeB)
if (typeof chromeC !== 'undefined') bs.push(chromeC)

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
