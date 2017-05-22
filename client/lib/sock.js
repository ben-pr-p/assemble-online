import io from 'socket.io-client'
import megabytes from './megabytes'

const room = window.location.pathname.split('/')[2]
const sock = io(`/${room}`)

const BANDWIDTH_ROUNDS = 20

Promise.all([
  megabytes.download(BANDWIDTH_ROUNDS, []),
  megabytes.upload(BANDWIDTH_ROUNDS, [])
])
  .then(([download, upload]) => sock.emit('my-bandwidth', { download, upload }))
  .catch(err => {
    throw err
  })

export default sock
