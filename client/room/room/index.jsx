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
    dimensions: [],
    translate: [0, 0],
    localStream: null,
    localMedia: { audio: true, video: false },
  }

  mousePos = {}
  intervalId = null

  componentWillMount() {
    this.state.localMedia = {
      audio: this.props.me.audio == true || this.props.me.audio == 'true',
      video: this.props.me.video == true || this.props.me.video == 'true',
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

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  setStream = () => {
    navigator.getUserMedia(
      { audio:  media.constraints.audio, video: media.constraints.video },
      // on success
      stream => {
        this.state.localStream = stream
        this.syncTrackEnabled()
        this.forceUpdate()

        // Announce that I'm ready to receive signals
        Sock.emit('me', Object.assign({ signalReady: true }, store.get('me')))

        VolumeDetector.register(stream, rms => Sock.emit('volume', rms))
      },
      // on failure
      error => {
        if (DEBUG) console.log(error)
      }
    )
  }

  toggleStream = type => {
    this.state.localMedia[type] = !this.state.localMedia[type]
    this.syncTrackEnabled()
    this.forceUpdate()
  }

  syncTrackEnabled = () => {
    if (this.state.localStream) {
      const audioTrack = this.state.localStream.getAudioTracks()[0]
      const videoTrack = this.state.localStream.getVideoTracks()[0]

      const { audio, video } = this.state.localMedia
      if (audioTrack) audioTrack.enabled = audio == 'true' || audio == true
      if (videoTrack) videoTrack.enabled = video == 'true' || video == true
    }
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

  render() {
    const { me, users, checkpoints } = this.props
    const { translate, dimensions, localStream } = this.state

    const userBlobs = users
      .filter(u => u)
      .map((u, idx) => (
        <UserBlob
          key={u.id}
          user={u}
          localStream={localStream}
          translate={translate}
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
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
      >
        <div
          id="viewport"
          style={{
            transform: `translate(${translate[0]}px, ${translate[1]}px)`,
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
