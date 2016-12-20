describe('After A creates the Test widget, A and B should see it within 10ms', function () {
  it('A can click menu, widgets, test widget', function () {
    chromeA
      .click('.menu-bar')
      .click('#Widgets')
      .click('#Test')
  })

  it('after A creates Test, B and C see it', function () {

  })
})
