import { Component, h } from 'preact'
import Sock from '../../lib/sock'
import { ToPeers, FromPeers } from '../../lib/emitters'
import Peer from 'simple-peer'

export default class Connection extends Component {
  peer = null
  state = {}

  componentWillMount () {
    const {myId, partnerId, localStream} = this.props

    if (myId != partnerId)
      this.initialize()
    else
      this.state.remoteSrc = window.URL.createObjectURL(localStream)

    Sock.on(`attenuation-for-${partnerId}`, this.handleAttenuation)
    ToPeers.on(`to-${partnerId}`, this.sendData)
    ToPeers.on(`to-all`, this.sendData)
  }

  sendData = data => this.peer
    ? this.peer.send(JSON.stringify(data))
    : null

  handleData = raw => this._handleData(JSON.parse(raw.toString()))
  _handleData = data => data.event
    ? FromPeers.emit(data.event, data.data)
    : null

  componentDidMount () {
    const {myId, partnerId, localStream} = this.props

    if (myId == partnerId)
      this.vidEl.volume = 0
  }

  componentWillUnmount () {
    const {partnerId} = this.props

    this.peer.destroy()
    this.peer = null

    ToPeers.off(`to-${partnerId}`, this.sendData)
    ToPeers.off(`to-all`, this.sendData)
    Sock.off(`webrtc-config-${partnerId}`)
    Sock.off(`attenuation-for-${partnerId}`)
    this.props.setStatus('disconnected')
  }

  initialize = () => {
    const {myId, partnerId, localStream, setStatus} = this.props

    this.peer = new Peer({
      initiator: myId < partnerId,
      stream: localStream
    })

    setStatus('connecting')

    this.peer.on('signal', config => Sock.emit('webrtc/config', {
      from: myId,
      to: partnerId,
      data: config
    }))

    Sock.on(`webrtc-config-${partnerId}`, config => {
      this.peer.signal(config)
    })

    this.peer.on('stream', remoteStream => {
      if (this.vidEl)
        this.vidEl.srcObject = remoteStream
      setStatus('connected')
    })

    this.peer.on('data', this.handleData)
    this.peer.on('connect', () => ToPeers.emit(`connected-to-${partnerId}`))
  }

  handleAttenuation = (vol) => this.vidEl
    ? this.vidEl.volume = vol
    : null

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
