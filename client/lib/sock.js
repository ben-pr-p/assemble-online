import io from 'socket.io-client'

const room = window.location.pathname.split('/')[2]
const sock = io(`/${room}`)

export default sock
