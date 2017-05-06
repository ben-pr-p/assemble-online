/* eslint no-console: 0 */

import React, { Component } from 'react'
import SimplePeer from 'react-simple-peer'
import shallowCompare from 'shallow-compare'
import Sock from '../../lib/sock'
import Updates from '../../lib/updates'
import media from '../../lib/media'
import { ToPeers, FromPeers, Connections } from '../../lib/emitters'
import VolumeDetector from '../room/volume-detector'
import objHash from 'object-hash'

const DEBUG = false
const HASH = false

const format = HASH ? objHash : JSON.stringify

export default class Connection extends Component {
  peer = null
  isMe = false

  componentWillMount() {
    this.isMe = Sock.id == this.props.partnerId
  }

  componentDidMount() {
    const { partnerId, localStream } = this.props

    Sock.on(`signal-from-${partnerId}`, this.handleSignal)
    Updates.on(`attenuation-for-${partnerId}`, this.handleAttenuation)

    if (this.isMe) {
      this.vidEl.srcObject = localStream
      this.vidEl.volume = 0
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.localStream != nextProps.localStream) {
      this.vidEl.srcObject = nextProps.localStream
    }
  }

  sendData = data => this.peer && this.peer.send(data)
  handleData = data => data.event && FromPeers.emit(data.event, data.data)

  componentWillUnmount() {
    const { partnerId } = this.props

    ToPeers.off(`to-${partnerId}`, this.sendData)
    ToPeers.off('to-all', this.sendData)
    Sock.off(`signal-from-${partnerId}`, this.handleSignal)
    Updates.off(`attenuation-for-${partnerId}`)

    ToPeers.emit(`disconnected-from-${partnerId}`)
    this.props.setStatus('disconnected')
  }

  onError = err => this.props.setStatus('connecting')

  onConnect = () => {
    ToPeers.on(`to-${this.props.partnerId}`, this.sendData)
    ToPeers.on('to-all', this.sendData)

    ToPeers.emit(`connected-to-${this.props.partnerId}`)
  }

  onSignal = data =>
    Sock.emit('signal', {
      to: this.props.partnerId,
      data
    })

  onStream = remoteStream => {
    this.vidEl && this.vidEl.srcObject
    this.vidEl.srcObject = remoteStream
    this.props.setStatus('connected')
  }

  handleSignal = config => this.peer.signal(config)

  handleAttenuation = vol => {
    if (this.vidEl) this.vidEl.volume = vol
  }

  setVidRef = ref => (this.vidEl = ref)
  setPeerRef = ref => (this.peer = ref)

  render() {
    const { partnerId, localStream } = this.props

    const showVideo = this.props.video

    return (
      <div>
        <video
          key="video"
          autoPlay
          style={{
            position: 'absolute',
            left: showVideo ? -18.75 : 0,
            transform: 'rotateY(180deg)'
          }}
          width={showVideo ? '150' : '0'}
          height={showVideo ? '100' : '0'}
          ref={this.setVidRef}
        />
        {!this.isMe &&
          <SimplePeer
            key="peer"
            ref={this.setPeerRef}
            initiator={Sock.id < partnerId}
            stream={localStream}
            onSignal={this.onSignal}
            onData={this.handleData}
            onConnect={this.onConnect}
            onStream={this.onStream}
            onError={this.onError}
          />}
      </div>
    )
  }
}
