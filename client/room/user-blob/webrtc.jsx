/* eslint no-console: 0 */

import React, { Component } from 'react'
import Sock from '../../lib/sock'
import Updates from '../../lib/updates'
import { ToPeers, FromPeers } from '../../lib/emitters'
import Peer from 'simple-peer'
import VolumeDetector from '../room/volume-detector'
import objHash from 'object-hash'

const DEBUG = true
const HASH = true

const format = HASH ? objHash : JSON.stringify

export default class Connection extends Component {
  peer = null
  isMe = false

  componentWillMount () {
    if (Sock.id == this.props.partnerId)
      this.isMe = true
  }

  componentDidMount () {
    const { partnerId, localStream } = this.props

    if (!this.isMe) {
      if (localStream) {
        this.initialize()
      } else {
        if (DEBUG) console.log('Waiting for stream')
      }

      Updates.on(`attenuation-for-${partnerId}`, this.handleAttenuation)
    } else {
      if (localStream) {
        this.vidEl.srcObject = localStream
        this.vidEl.volume = 0
      }
    }
  }

  componentWillReceiveProps ({ localStream, audio, video }) {
    if (this.props.localStream !== localStream) {
      if (this.peer) {
        if (DEBUG) console.log('Destorying peer in componentWillReceiveProps because of new self stream')
        this.peer.destroy()
        this.peer = null
      }

      if (this.isMe) {
        if (DEBUG) console.log('Setting local stream for self video')
        this.vidEl.srcObject = localStream
        this.vidEl.volume = 0
      } else {
        this.initialize(localStream)
      }
    }
  }

  sendData = data => this.peer
    ? this.peer.send(JSON.stringify(data))
    : null

  handleData = raw => this._handleData(JSON.parse(raw.toString()))
  _handleData = data => data.event
    ? FromPeers.emit(data.event, data.data)
    : null

  componentWillUnmount () {
    const { partnerId } = this.props

    if (DEBUG) console.log('Destorying peer in componentWillUnmount')
    this.peer.destroy()
    this.peer = null

    ToPeers.off(`to-${partnerId}`, this.sendData)
    ToPeers.off('to-all', this.sendData)
    Sock.off(`signal-from-${partnerId}`, this.handleSignal)
    Updates.off(`attenuation-for-${partnerId}`)
    this.props.setStatus('disconnected')
  }

  initialize = (optionalLocalStream) => {
    const { partnerId, setStatus } = this.props
    const localStream = optionalLocalStream || this.props.localStream

    if (DEBUG) {
      console.log(`Initializing with localStream ${localStream}`)
      console.log(`I am ${Sock.id}`)
      console.log(`Connecting to partner ${partnerId}`)
    }

    setStatus('connecting')

    this.peer = new Peer({
      initiator: Sock.id < partnerId,
      stream: localStream
    })

    this.peer.on('error', err => {
      console.log('Got error')
      console.error(err)
      setStatus('connecting')
    })

    this.peer.on('connect', () => {
      if (DEBUG) console.log(`connected to ${partnerId}`)

      ToPeers.on(`to-${partnerId}`, this.sendData)
      ToPeers.on('to-all', this.sendData)

      ToPeers.emit(`connected-to-${partnerId}`)
    })

    this.peer.on('signal', config => {
      if (DEBUG) console.log(`sending signal ${format(config)}`)

      Sock.emit('signal', {
        to: partnerId,
        data: config
      })
    })

    if (DEBUG) console.log('setting signal handlers')
    Sock.on(`signal-from-${partnerId}`, this.handleSignal)

    this.peer.on('stream', remoteStream => {
      if (DEBUG) console.log(`received stream from ${partnerId}`)

      if (this.vidEl) {
        this.vidEl.srcObject = remoteStream
        if (DEBUG) console.log('setting src object')
      }

      setStatus('connected')
    })

    this.peer.on('data', this.handleData)
  }

  handleSignal = config => {
    if (DEBUG) console.log(`got signal ${format(config)}`)
    this.peer.signal(config)
  }

  handleAttenuation = vol => {
    if (this.vidEl) this.vidEl.volume = vol
  }

  setRef = ref => this.vidEl = ref

  render () {
    const { partnerId, localStream } = this.props

    const showVideo = this.isMe && localStream && localStream.getVideoTracks().length > 0

    return (
      <video autoPlay
        style={{
          position: 'absolute',
          left: showVideo ? -18.75 : 0,
          transform: 'rotateY(180deg)'
        }}
        width={showVideo ? '150' : '0'}
        height={showVideo ? '100' : '0'}
        ref={this.setRef}
      />
    )
  }
}
