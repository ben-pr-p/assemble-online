import { Component, h } from 'preact'
import Sock from '../../lib/sock'
import Updates from '../../lib/updates'
import { ToPeers, FromPeers } from '../../lib/emitters'
import Peer from 'simple-peer'
import VolumeDetector from '../room/volume-detector'

const DEBUG = false

export default class Connection extends Component {
  peer = null

  componentWillMount () {
    const {myId, partnerId, localStream} = this.props
    if (myId != partnerId && localStream) {
      if (DEBUG) console.log(`Initializing with localStream ${localStream}`)
      this.initialize()
    } else {
      if (DEBUG) console.log('Waiting for stream')
    }

    Updates.on(`attenuation-for-${partnerId}`, this.handleAttenuation)
    ToPeers.on(`to-${partnerId}`, this.sendData)
    ToPeers.on('to-all', this.sendData)
  }

  componentDidUpdate () {
    const {myId, partnerId, localStream} = this.props
    if (myId != partnerId && localStream && this.peer == null)
      this.initialize()
  }

  sendData = data => this.peer
    ? this.peer.send(JSON.stringify(data))
    : null

  handleData = raw => this._handleData(JSON.parse(raw.toString()))
  _handleData = data => data.event
    ? FromPeers.emit(data.event, data.data)
    : null

  componentWillUnmount () {
    const {partnerId} = this.props

    this.peer.destroy()
    this.peer = null

    ToPeers.off(`to-${partnerId}`, this.sendData)
    ToPeers.off('to-all', this.sendData)
    Sock.off(`signal-from-${partnerId}`, this.handleSignal)
    Updates.off(`attenuation-for-${partnerId}`)
    this.props.setStatus('disconnected')
  }

  initialize = () => {
    const {partnerId, localStream, setStatus} = this.props
    setStatus('connecting')

    if (DEBUG) console.log(`sending stream ${localStream}`)

    this.peer = new Peer({
      initiator: Sock.id < partnerId,
      stream: localStream
    })

    this.peer.on('error', err => {
      console.error(err)
      setStatus('connecting')
    })

    this.peer.on('connect', () => {
      if (DEBUG) console.log(`connected to ${partnerId}`)
      setStatus('connected')
      ToPeers.emit(`connected-to-${partnerId}`)
    })

    this.peer.on('signal', config => {
      if (DEBUG) console.log(`sending signal ${JSON.stringify(config)}`)

      Sock.emit('signal', {
        to: partnerId,
        data: config
      })
    })

    Sock.on(`signal-from-${partnerId}`, this.handleSignal)

    this.peer.on('stream', remoteStream => {
      if (DEBUG) console.log(`received stream from ${partnerId}`)

      if (this.vidEl) {
        this.vidEl.srcObject = remoteStream
        if (DEBUG) console.log(`setting src object`)
      }

      setStatus('connected')
    })

    this.peer.on('data', this.handleData)
  }

  handleSignal = config => {
    if (DEBUG) console.log(`got signal ${JSON.stringify(config)}`)
    this.peer.signal(config)
  }

  handleAttenuation = vol => {
    if (this.vidEl) this.vidEl.volume = vol
  }

  setRef = ref => this.vidEl = ref

  render ({myId, partnerId}) {
    return (
      <video autoPlay=''
        width='0'
        height='0'
        ref={this.setRef}
      />
    )
  }
}
