/* eslint no-console: 0 */

import React, { Component } from 'react'
import Grid from '../grid'
import UserBlob from '../user-blob'
import CheckpointBlob from '../checkpoint-blob'
import Sock from '../../lib/sock'
import Updates from '../../lib/updates'
import VolumeDetector from './volume-detector'

const DEBUG = false
const UPDATE_INTERVAL = 30

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

export default class Room extends Component {
  state = {
    dimensions: [],
    translate: [0, 0],
    localStream: null
  }

  mousePos = {}
  intervalId = null

  componentWillMount () {
    this.state.localMedia = {
      audio: this.props.me.audio === undefined || this.props.me.audio,
      video: this.props.me.video === undefined || this.props.me.video
    }

    Sock.on('dimensions', this.handleDimensions)
    Updates.on('translate', this.handleTranslate)

    this.setStream()
  }

  componentWillUnmount () {
    Sock.off('dimensions', this.handleDimensions)
    Updates.off('translate', this.handleTranslate)
    VolumeDetector.detach()
  }

  setStream = () => {
    if (this.state.localStream) {
      // kill localStream
      this.state.localStream.getAudioTracks().forEach(mt => mt.stop())
      this.state.localStream.getVideoTracks().forEach(mt => mt.stop())
      VolumeDetector.detach()
    }

    if (Object.values(this.state.localMedia).every(val => !val)) {
      return this.setState({ localStream: null })
    }

    navigator.getUserMedia(this.state.localMedia,
      // on success
      stream => {
        this.setState({ localStream: stream })
        VolumeDetector.register(stream, rms => Sock.emit('volume', rms))
      },
      // on failure
      error => { if (DEBUG) console.log(error) }
    )
  }

  toggleStream = type => {
    this.state.localMedia[type] = !this.state.localMedia[type]
    this.setStream()
  }

  handleDimensions = (data) => this.setState({ dimensions: data })
  handleTranslate = (data) => this.setState({ translate: data })

  onMouseDown = (ev) => {
    if (['plaza', 'grid-main'].includes(ev.target.id)) {
      if (this.intervalId) clearInterval(this.intervalId)
      this.intervalId = setInterval(this.moveUser, UPDATE_INTERVAL)
    }
  }

  onMouseUp = () => clearInterval(this.intervalId)
  onMouseMove = ev => this.mousePos = [ev.clientX, ev.clientY]
  moveUser = () => Updates.emit('location', this.mousePos)

  render () {
    const { me, users, checkpoints } = this.props
    const { translate, dimensions, localStream } = this.state

    const userBlobs = users.filter(u => u).map((u, idx) => (
      <UserBlob key={u.id}
        user={u}
        localStream={localStream}
        translate={translate}
        isMe={me && u.id == Sock.id}
        toggleStream={this.toggleStream}
      />
    ))

    const checkpointBlobs = checkpoints.map((c, idx) => (
      <CheckpointBlob key={c.id}
        checkpoint={c}
        translate={translate}
      />
    ))

    return (
      <div id='plaza' tabIndex='1'
        onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove} onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
      >
        <div id='viewport' style={{
          transform: `translate(${translate[0]}px, ${translate[1]}px)`
        }} >
          <Grid dimensions={dimensions} />
          {userBlobs}
          {checkpointBlobs}
        </div>
      </div>
    )
  }
}
