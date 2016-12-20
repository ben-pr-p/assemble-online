describe('room should load', function () {
  it('should have #main-app', function () {
    browser.waitForVisible('#main-app')
    expect([...new Set(Object.values(browser.getTagName('#main-app')))][0])
      .to.equal('div')
  })
})

describe('after A and B do profile, 2 blobs should exist', function () {
  it('#name field should exist', function () {
    expect([...new Set(Object.values(browser.getTagName('#name')))][0])
      .to.equal('input')
  })

  describe('A and B should do profile', function () {
    before(function () {
      chromeA.setValue('#name', 'chromeA')
      chromeB.setValue('#name', 'chromeB')

      browser.click('.submit')

      browser.waitForVisible('.user-blob')
    })

    it('A should see two blobs', function () {
      browser.pause(1000)
      expect(
        chromeA.getTagName('.user-blob')
      ).to.have.length(2)
    })

    it('B should see two blobs', function () {
      browser.pause(1000)
      expect(
        chromeB.getTagName('.user-blob')
      ).to.have.length(2)
    })
  })
})
