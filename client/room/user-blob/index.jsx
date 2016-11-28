import { Component, h } from 'preact'
import lineIntersect from 'line-intersect'
import Avatar from '../../common/Avatar'
import Boss from '../../lib/boss'
import VolumeIndicator from './volume-indicator'
import Badge from './badge'

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

const initialize = name => {
  const subnames = name.split(' ')
  return [subnames.shift(), subnames.pop()]
}

export default class UserBlob extends Component {
  state = {
    showCard: false,
    location: {x: 0, y: 0}
  }

  componentWillMount () {
    Boss.on(`location-${this.props.user.id}`, this.handleLocation, `blob-${this.props.user.id}`)
  }

  componentWillUnmount () {
    Boss.offAllByCaller(`blob-${this.props.user.id}`)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.location.x != nextState.location.x || this.state.location.y != nextState.location.y)
      return true
    if (this.state.showCard != nextState.showCard)
      return true
    if (this.props.translate.x != nextProps.translate.x || this.props.translate.y != nextProps.translate.y)
      return true

    const userProps = ['id', 'avatar', 'badge']
    let userChanged = false
    userProps.forEach(prop => {
      if (this.props.user[prop] != nextProps.user[prop])
        userChanged = true
    })
    return userChanged
  }

  handleLocation = (data) => this.setState({ location: data })

  render ({user, idx, translate, me, isMe}, {location}) {
    let { x, y } = location
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    this.color = user.color

    if (!this.color) {
      this.color = colorScale(this.props.idx)
      this.props.setMyColor(this.color)
    }

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    if (!(isMe) && (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight)) {
      return this.renderFar(user, x, y, translate)
    } else {
      return this.renderClose(user, x, y)
    }
  }

  renderFar (user, x, y, trans) {
    const center = {
      x: (window.innerWidth / 2) - trans.x,
      y: (window.innerHeight / 2) - trans.y
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

    return (
      <g className='user-blob offscreen' id={user.id} >
        <defs>
          {this.renderInsides(user, sd)}
          <marker id='arrow' viewBox='0 -5 10 10' refX='5' refY='0' markerWidth='20' markerHeight='16' orient='auto'>
            <path d='M0,-5L10,0L0,5' className='arrowHead' stroke={this.color} fill={this.color} />
          </marker>
        </defs>
        <circle transform={`translate(${x},${y})`} r={sr} fill={this.fill} strokeWidth='6px' stroke='black' />
        <line x1={x} y1={y}
          x2={x + (dx / 4)} y2={y + (dy / 4)}
          className='arrow' markerEnd='url(#arrow)' />
        <VolumeIndicator {...{user, d: sd, color: this.color}} />
        <Badge {...{x, y, r, user}} />
      </g>
    )
  }

  renderClose (user, x, y) {
    return (
      <div className='user-blob' id={user.id}
        style={{
          width: `${d}px`,
          height: `${d}px`,
          transform: `translate3d(${x}px,${y}px, 0px)`
        }}
      >
        <Avatar src={user.avatar} letters={initialize(user.name)} style={{position:'absolute'}} />
        <VolumeIndicator {...{d, user, color: this.color}} />
        {/* <Badge {...{x, y, r, user}} /> */}
      </div>
    )
  }
}
