import React, { Component } from 'react'
import shallowCompare from 'shallow-compare'
import media from '../../lib/media'
import Grid from '../grid'
import UserBlob from '../user-blob'
import CheckpointBlob from '../checkpoint-blob'
import Sock from '../../lib/sock'
import Updates from '../../lib/updates'
import VolumeDetector from './volume-detector'
import store from 'store'

const DEBUG = false
const UPDATE_INTERVAL = 30

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia

/* eslint no-console: 0 */

export default class Room extends Component {
  state = {
    panning: false,
    dimensions: [],
    translate: [0, 0],
    localStream: null
  }

  panning = false

  mousePos = {}
  intervalId = null

  componentWillMount() {
    this.state.localMedia = {
      audio: this.props.me.audio == true || this.props.me.audio == 'true',
      video: this.props.me.video == true || this.props.me.video == 'true'
    }

    Sock.on('dimensions', this.handleDimensions)
    Updates.on('translate', this.handleTranslate)

    this.setStream()
  }

  componentWillUnmount() {
    Sock.off('dimensions', this.handleDimensions)
    Updates.off('translate', this.handleTranslate)
    VolumeDetector.detach()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  setStream = () => {
    const { audio, video } = this.state.localMedia

    if (this.state.localStream) {
      this.state.localStream.getAudioTracks().forEach(t => t.stop())
      this.state.localStream.getVideoTracks().forEach(t => t.stop())
      this.state.localStream = null
      VolumeDetector.detach()
    }

    if (audio || video) {
      /* We should always get audio if we are getting video */
      navigator.getUserMedia(
        {
          audio: audio || video ? media.constraints.audio : false,
          video: video ? media.constraints.video : false
        },
        // on success
        stream => {
          this.state.localStream = stream
          this.setAudioEnabled()
          this.forceUpdate()

          VolumeDetector.register(stream, rms => Sock.emit('volume', rms))
        },
        // on failure
        error => console.log(error)
      )
    }
  }

  toggleStream = type => {
    this.state.localMedia[type] = !this.state.localMedia[type]
    this.setStream()
  }

  setAudioEnabled = () => {
    const audioTrack = this.state.localStream.getAudioTracks()[0]
    if (audioTrack) audioTrack.enabled = this.state.localMedia.audio
  }

  handleDimensions = data => this.setState({ dimensions: data })
  handleTranslate = data => this.setState({ translate: data })

  /*
   * agar.io style movement - disabled
   */

  // onMouseDown = (ev) => {
  //   if (['plaza', 'grid-main'].includes(ev.target.id)) {
  //     if (this.intervalId) clearInterval(this.intervalId)
  //     this.intervalId = setInterval(this.moveUser, UPDATE_INTERVAL)
  //   }
  // }
  //
  // onMouseUp = () => clearInterval(this.intervalId)
  // onMouseMove = ev => this.mousePos = [ev.clientX, ev.clientY]
  // moveUser = () => Updates.emit('location', this.mousePos)

  /*
   * pan + dbl click style movement - enabled
   */

  onDoubleClick = ev => {
    const { left, top } = document.querySelector(`#id-${Sock.id}`).getBoundingClientRect()
    const delta = [ ev.clientX - left - 50, ev.clientY - top - 50]
    Updates.emit('move-delta', delta)
  }

  onMouseDown = ev => {
    if (ev.target.id == 'grid-main') {
      this.state.panning = true
      document.addEventListener('mousemove', this.pan)
    }
  }

  onMouseUp = () => {
    if (this.state.panning) {
      this.state.panning = false
      document.removeEventListener('mousemove', this.pan)
    }
  }

  pan = ev => {
    if (this.state.panning) {
      this.setState({
        translate: [
          this.state.translate[0] + ev.movementX,
          this.state.translate[1] + ev.movementY
        ]
      })
    }
  }

  render() {
    const { me, users, checkpoints } = this.props
    const { translate, dimensions, localStream, panning } = this.state

    const userBlobs = users
      .filter(u => u)
      .map((u, idx) => (
        <UserBlob
          key={u.id}
          user={u}
          localStream={localStream}
          translate={translate}
          me={me}
          isMe={me && u.id == Sock.id}
          toggleStream={this.toggleStream}
          dimensions={dimensions}
        />
      ))

    const checkpointBlobs = checkpoints.map((c, idx) => (
      <CheckpointBlob key={c.id} checkpoint={c} translate={translate} />
    ))

    return (
      <div
        id="plaza"
        tabIndex="1"
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <div
          id="viewport"
          className={panning ? 'panning' : 'not-panning'}
          style={{
            transform: `translate(${translate[0]}px, ${translate[1]}px)`
          }}
        >
          <Grid dimensions={dimensions} />
          {userBlobs}
          {checkpointBlobs}
        </div>
      </div>
    )
  }
}
