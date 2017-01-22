import { Component, h } from 'preact'
import lineIntersect from 'line-intersect'
import Avatar from '../../common/Avatar'
import Updates from '../../lib/updates'
import VolumeIndicator from './volume-indicator'
// import Badge from './badge'
import WebRTC from './webrtc'

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
    showCard: false,
    location: {x: 0, y: 0},
    status: 'disconnected'
  }

  componentWillMount () {
    Updates.on(`location-${this.props.user.id}`, this.handleLocation)
    if (this.props.isMe) this.state.status = 'connected'
  }

  componentWillUnmount () {
    Updates.off(`location-${this.props.user.id}`, this.handleLocation)
  }

  setStatus = (status) => this.setState({ status })

  handleLocation = (data) => {
    this.setState({ location: data })
  }

  render ({user, translate, isMe, localStream}, {location, status}) {
    let { x, y } = location
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    const isFar = this.isFar({adj, isMe, x, y, translate})
    const specificD = (isFar ? sd: d)

    return (
      <div className='user-blob' id={user.id}
        style={Object.assign(
          this.computeWidthHeight(isFar),
          this.computeTransform(isFar, {x, y, translate})
        )}
      >
        {/* <Avatar src={user.avatar} letters={initialize(user.name)} style={{position:'absolute'}} /> */}
        <VolumeIndicator {...{d: specificD, user, status}} />
        {!isMe
          ? <WebRTC partnerId={user.id} localStream={localStream} setStatus={this.setStatus} status={status} />
          : null
        }
        {/* <Badge {...{x, y, d: specificD, user}} /> */}
      </div>
    )
  }

  isFar ({adj, isMe, x, y, translate}) {
    return (!(isMe) && (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight))
  }

  computeWidthHeight = (isFar) => !isFar
    ? {width: `${d}px`, height: `${d}px`}
    : {width: `${sd}px`, height: `${sd}px`}

  computeTransform = (isFar, {x, y, translate}) => !isFar
    ? {transform: `translate3d(${x}px,${y}px, 0px)`}
    : this.computeFarTransform({x, y, translate})

  computeFarTransform = ({x, y, translate}) => {
    const center = {
      x: (window.innerWidth / 2) - translate.x,
      y: (window.innerHeight / 2) - translate.y
    }

    const halfW = window.innerWidth / 2
    const halfH = window.innerHeight / 2
    const edges = {
      left: { start: { x: center.x - halfW, y: center.y - halfH }, end: { x: center.x - halfW, y: center.y + halfH } },
      right: { start: { x: center.x + halfW, y: center.y - halfH }, end: { x: center.x + halfW, y: center.y + halfH } },
      top: { start: { x: center.x - halfW, y: center.y - halfH }, end: { x: center.x + halfW, y: center.y - halfH } },
      bottom: { start: { x: center.x - halfW, y: center.y + halfH }, end: { x: center.x + halfW, y: center.y + halfH } }
    }

    const line = {start: {x: center.x, y: center.y} , end: {x, y}}
    const intersects = {
      left: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, edges.left.start.x, edges.left.start.y, edges.left.end.x, edges.left.end.y),
      right: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, edges.right.start.x, edges.right.start.y, edges.right.end.x, edges.right.end.y),
      top: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, edges.top.start.x, edges.top.start.y, edges.top.end.x, edges.top.end.y),
      bottom: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, edges.bottom.start.x, edges.bottom.start.y, edges.bottom.end.x, edges.bottom.end.y)
    }

    let p, intersectingWall
    for (let wall in intersects) {
      if (intersects[wall].type == 'intersecting') {
        p = intersects[wall].point
        intersectingWall = wall
      }
    }

    if (!p) return (<div> </div>)

    let dx, dy
    switch (intersectingWall) {
      case 'left':
        dx = 2 * sr
        dy = 0
        break

      case 'right':
        dx = (-2) * sr
        dy = 0
        break

      case 'top':
        dx = 0
        dy = 3 * sr
        break

      case 'bottom':
        dx = 0
        dy = (-2) * sr
        break
    }

    return {
      x: p.x + dx,
      y: p.y + dy
    }
  }
}
