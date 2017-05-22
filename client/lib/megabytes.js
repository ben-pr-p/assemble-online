import rq from 'superagent'

const mb = new Blob([new ArrayBuffer(1000000)], {
  type: 'application/octet-binary'
})

const upload = () =>
  new Promise((resolve, reject) =>
    rq
      .post('/megabyte')
      .send(mb)
      .end((err, res) => (err ? reject(err) : resolve(true)))
  )

const download = () =>
  new Promise((resolve, reject) =>
    rq.get('/megabyte').end((err, res) => (err ? reject(err) : resolve(true)))
  )

const test = (networkFn, rounds_left, timestamps) =>
  new Promise((resolve, reject) => {
    if (rounds_left == 0) {
      const finaltimes = timestamps.concat([performance.now()])

      const loadtimes = new Array(timestamps.length - 1)
        .fill(null)
        .map((_, idx) => timestamps[idx + 1] - timestamps[idx])

      return resolve({
        average: loadtimes.reduce((a, b) => a + b) / loadtimes.length,
        max: Math.max(...loadtimes),
        min: Math.min(...loadtimes)
      })
    }

    networkFn()
      .then(() =>
        test(networkFn, rounds_left - 1, timestamps.concat([performance.now()]))
          .then(resolve)
          .catch(reject)
      )
      .catch(reject)
  })

export default {
  download: (rounds_left, timestamps) => test(download, rounds_left, timestamps),
  upload: (rounds_left, timestamps) => test(upload, rounds_left, timestamps)
}
