import { Component, h } from 'preact'
import Boss from '../../lib/boss'
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

    Boss.on(`attenuation-for-${partnerId}`, this.handleAttenuation, `connection-to-${partnerId}`)
  }

  componentDidMount () {
    const {myId, partnerId, localStream} = this.props

    if (myId == partnerId)
      this.vidEl.volume = 0
  }

  componentWillUnmount () {
    const {partnerId} = this.props
    Boss.offAllByCaller(`connection-to-${partnerId}`)
    this.peer.destroy()
  }

  initialize = () => {
    const {myId, partnerId, localStream} = this.props

    this.peer = new Peer({
      initiator: myId < partnerId,
      stream: localStream
    })

    this.peer.on('signal', config => Boss.post('webrtc/config', {
      from: myId,
      to: partnerId,
      data: config
    }))

    Boss.on(`webrtc-config-${partnerId}`, config => {
      this.peer.signal(config)
    })

    this.peer.on('stream', remoteStream => this.vidEl
      ? this.vidEl.srcObject = remoteStream
      : null
    )
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
