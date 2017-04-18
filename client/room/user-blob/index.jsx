import React, { Component } from 'react'
import lineIntersect from 'line-intersect'
import Avatar from '../../common/avatar'
import Updates from '../../lib/updates'
import VolumeIndicator from './volume-indicator'
import WebRTC from './webrtc'
import Controls from './controls'
import { Run } from '../../common/icons'

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
    location: [0,0],
    status: 'disconnected',
    controlsShown: false
  }

  componentWillMount () {
    Updates.on(`location-${this.props.user.id}`, this.handleLocation)
    if (this.props.isMe) this.state.status = 'connected'
  }

  componentWillUnmount () {
    Updates.off(`location-${this.props.user.id}`, this.handleLocation)
  }

  setStatus = status => this.setState({ status })
  handleLocation = data => this.setState({ location: data })
  toggleControls = () => this.setState({ controlsShown: !this.state.controlsShown })

  render () {
		const {user, translate, isMe, localStream} = this.props
		const {location, status, controlsShown} = this.state

    let [ x, y ] = location
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    const isFar = false
    const specificD = (isFar ? sd: d)

    const [away, audio, video] = ['away', 'audio', 'video'].map(attr => user[attr] == 'true')

    return (
      <div className={`user-blob ${isMe && 'me'}`}
        id={user.id} onClick={this.toggleControls}
        style={Object.assign(
          this.computeWidthHeight(isFar),
          this.computeTransform(isFar, {x, y, translate})
        )}
      >
        {away && (
          <div style={this.computeWidthHeight(isFar)} className='user-blob-away-overlay'>
            <Run color='white' />
          </div>
        )}

        {!video && [
          <Avatar src={user.avatar} letters={initialize(user.name)} style={{position:'absolute'}} />,
        ]}

        <VolumeIndicator {...{d: specificD, user, status}} />

        <div className='video-clip'>
          <WebRTC partnerId={user.id}
            localStream={localStream}
            setStatus={this.setStatus}
            status={status}
          />
        </div>

        {isMe && controlsShown &&
          <Controls {...{away, audio, video, toggleStream: this.props.toggleStream}} />
        }
      </div>
    )
  }

  isFar ({adj, isMe, x, y, translate}) {
    return (!(isMe) && (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight))
  }

  computeWidthHeight = (isFar) => !isFar
    ? {width: `${d}px`, height: `${d}px`}
    : {width: `${sd}px`, height: `${sd}px`}

  computeTransform = (isFar, {x, y, translate}) => true //!isFar
    ? {transform: `translate(${x}px,${y}px)`}
    : this.computeFarTransform({x, y, translate})
}
