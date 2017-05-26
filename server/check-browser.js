// Amaya, Android Browser, Arora, Avant, Baidu, Blazer, Bolt, Camino, Chimera, Chrome,
// Chromium, Comodo Dragon, Conkeror, Dillo, Dolphin, Doris, Edge, Epiphany, Fennec,
// Firebird, Firefox, Flock, GoBrowser, iCab, ICE Browser, IceApe, IceCat, IceDragon,
// Iceweasel, IE [Mobile], Iron, Jasmine, K-Meleon, Konqueror, Kindle, Links,
// Lunascape, Lynx, Maemo, Maxthon, Midori, Minimo, MIUI Browser, [Mobile] Safari,
// Mosaic, Mozilla, Netfront, Netscape, NetSurf, Nokia, OmniWeb, Opera [Mini/Mobi/Tablet],
// PhantomJS, Phoenix, Polaris, QQBrowser, RockMelt, Silk, Skyfire, SeaMonkey, SlimBrowser,
// Swiftfox, Tizen, UCBrowser, Vivaldi, w3m, WeChat, Yandex

const parser = require('ua-parser-js')

const goodBrowsers = [
  'Vivaldi',
  'Yandex',
  'Blazer',
  'Chrome',
  'Chimera',
  'Chromium',
  'Edge',
  'Opera'
]

module.exports = (req, res, next) => {
  const ua = parser(req.headers['user-agent'])
  const browser = ua.browser.name

  let good = false
  if (browser) {
    goodBrowsers.forEach(b => {
      if (browser.includes(b)) good = true
    })
  }

  if (good) return next()
  else res.render('bad-browser', { browser: browser || 'Your unknown browser' })
}
