import React, { Component } from 'react'
import lineIntersect from 'line-intersect'
import shallowCompare from 'shallow-compare'
import Avatar from '../../common/avatar'
import Updates from '../../lib/updates'
import VolumeIndicator from './volume-indicator'
import WebRTC from './webrtc'
import Controls from './controls'
import { Run } from '../../common/icons'
import { Tooltip } from 'antd'

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

const initialize = name => {
  const subnames = name.split(' ')
  return [subnames.shift(), subnames.pop()]
}

/*
 * User blob needs to:
     - show the location and volume of a person
     - show badges: (on the right?) (scrollable?)
        - how they voted
        - whether they want to talk next
    - show video if there (maybe as rectangle)
    - have A/V controls (on bottom?) (maybe the controls aren't part of the blob)
    -

 * On overlap
   - speaking order determines z-index?
   - bumper cars and lassos? or small bump
   -

 * Whatever I do to the circle needs to work for the rectangle

 * TODO
 * Big circle around me calibrated to audio distances
 * Should show name? Configurable?
 * Card shows up around name or something like that
 */

export default class UserBlob extends Component {
  state = {
    loc: [0, 0],
    tempLoc: [0, 0],
    dragging: false,
    status: 'disconnected',
    controlsShown: false
  }

  componentWillMount() {
    Updates.on(`location-${this.props.user.id}`, this.handleLocation)
    if (this.props.isMe) this.state.status = 'connected'
  }

  componentWillUnmount() {
    Updates.off(`location-${this.props.user.id}`, this.handleLocation)
  }

  handleLocation = data =>
    this.setState({
      loc: data
    })

  setStatus = status => this.setState({ status })
  toggleControls = () =>
    this.state.tempLoc[1] - this.state.loc[1] < 10 &&
    this.state.tempLoc[0] - this.state.loc[0] < 10 &&
    this.setState({ controlsShown: !this.state.controlsShown })

  /*
   * desktop application style movement
   */

  move = ev =>
    this.setState({
      tempLoc: [
        Math.max(
          Math.min(
            this.state.tempLoc[0] + ev.movementX,
            this.props.dimensions[0] - 100
          ),
          0
        ),
        Math.max(
          Math.min(
            this.state.tempLoc[1] + ev.movementY,
            this.props.dimensions[1] - 100
          ),
          0
        )
      ]
    })

  startTracking = () => {
    this.state.tempLoc = this.state.loc.slice()
    this.state.dragging = true
    document.addEventListener('mousemove', this.move)
    setTimeout(() => document.addEventListener('mouseup', this.stopTracking), 1)
  }

  stopTracking = () => {
    if (this.state.dragging) {
      document.removeEventListener('mousemove', this.move)
      Updates.emit('move-to', this.state.tempLoc)
      setTimeout(() => (this.state.dragging = false), 100)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (sum(nextState.loc) != sum(this.state.loc)) return true

    for (let attr of ['user', 'translate', 'isMe', 'localStream']) {
      if (this.props[attr] != nextProps[attr]) return true
    }

    for (let attr of ['tempLoc', 'dragging', 'status', 'controlsShown']) {
      if (this.state[attr] != nextState[attr]) return true
    }

    return false
  }

  render() {
    const { user, translate, isMe, localStream, me } = this.props
    const { loc, tempLoc, dragging, status, controlsShown } = this.state

    let x, y
    if (dragging) {
      [x, y] = tempLoc
    } else {
      [x, y] = loc
    }

    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    const isFar = false
    const specificD = isFar ? sd : d

    const [away, audio, video] = ['away', 'audio', 'video'].map(
      attr => user[attr] == 'true'
    )

    return (
      <div
        className={`user-blob ${isMe ? 'me' : 'other'}`}
        id={`id-${user.id}`}
        onClick={this.toggleControls}
        onMouseDown={isMe && this.startTracking}
        onMouseUp={isMe && this.stopTracking}
        style={Object.assign(
          this.computeWidthHeight(isFar),
          this.computeTransform(isFar, { x, y, translate })
        )}
      >
        {away &&
          <div
            style={this.computeWidthHeight(isFar)}
            className="user-blob-away-overlay"
          >
            <Run color="white" />
          </div>}

        {!video &&
          <Avatar
            src={user.avatar}
            letters={initialize(user.name)}
            style={{ position: 'absolute' }}
          />}

        <VolumeIndicator {...{ d: specificD, user, status, audio, video }} />

        <div className="video-clip">
          <WebRTC
            partnerEnabled={{ audio, video }}
            myEnabled={{ audio: me.audio == 'true', video: me.video == 'true' }}
            partnerId={user.id}
            localStream={localStream}
            setStatus={this.setStatus}
            status={status}
          />
        </div>

        {isMe &&
          controlsShown &&
          <Controls
            {...{ away, audio, video, toggleStream: this.props.toggleStream }}
          />}
      </div>
    )
  }

  isFar({ adj, isMe, x, y, translate }) {
    return (
      !isMe &&
      (adj.x < 0 ||
        adj.x > window.innerWidth ||
        adj.y < 0 ||
        adj.y > window.innerHeight)
    )
  }

  computeWidthHeight = isFar =>
    !isFar
      ? { width: `${d}px`, height: `${d}px` }
      : { width: `${sd}px`, height: `${sd}px` }

  computeTransform = (isFar, { x, y, translate }) =>
    !isFar
      ? { transform: `translate(${x}px,${y}px)` }
      : this.computeFarTransform({ x, y, translate })
}

function sum([a, b]) {
  return a + b
}
