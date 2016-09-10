const apisToExpose = 'action agenda announcement session user'.split(' ')
apisToExpose.forEach(api => {
  exports[api] = require('./' + api)
})
