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
      chromeA.setValue('#name', 'chromeA')
      chromeB.setValue('#name', 'chromeB')
      chromeC.setValue('#name', 'chromeC')

      browser.click('.submit')

      browser.waitForVisible('.user-blob')
    })

    it('A should see 3 blobs', function () {
      expect(
        chromeA.getTagName('.user-blob')
      ).to.have.length(3)
    })

    it('B should see 3 blobs', function () {
      expect(
        chromeB.getTagName('.user-blob')
      ).to.have.length(3)
    })

    it('C should see 3 blobs', function () {
      expect(
        chromeC.getTagName('.user-blob')
      ).to.have.length(3)
    })
  })
})

require('./widgets')
