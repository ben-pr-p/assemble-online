import React from 'react'
import ReactDOM from 'react-dom'
import { Motion, spring } from 'react-motion'
import lineIntersect from 'line-intersect'
import Color from 'color'
import Boss from '../../lib/boss'
import VolumeIndicator from './volume-indicator'
import Badge from './badge'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 * TO DO: ADD ARROWS
 */

const STIFFNESS = 141
const DAMPING = 30

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

export default class UserBlob extends React.Component {
  constructor () {
    super()
    this.state = {
      showCard: false,
      location: {x: 0, y: 0}
    }

    this.handleLocation = this.handleLocation.bind(this)
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

  handleLocation (data) {
    this.setState({
      location: data
    })
  }

  render () {
    const {user, location, volume, idx, translate, me, isMe} = this.props

    let { x, y } = this.state.location

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    this.fill = `url(#avatar-${user.id})`
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
      return this.renderFar(user, volume, x, y, translate)
    } else {
      return this.renderClose(user, volume, x, y)
    }
  }

  renderFar (user, volume, x, y, trans) {
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

    const params = {stiffness: STIFFNESS, damping: DAMPING}

    let badge
    if (user.badge)
      badge = (<Badge x={pos.x} y={pos.y} user={user} />)

    return (
      <Motion
        defaultStyle={{x: 0, y: 0}}
        style={{x: spring(p.x + dx, params), y: spring(p.y + dy, params)}}
      >
        {pos =>
          <g className='user-blob offscreen' id={user.id} >
            <defs>
              {this.renderInsides(user, sd)}
              <marker id='arrow' viewBox='0 -5 10 10' refX='5' refY='0' markerWidth='20' markerHeight='16' orient='auto'>
                <path d='M0,-5L10,0L0,5' className='arrowHead' stroke={this.color} fill={this.color} />
              </marker>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={sr} fill={this.fill} strokeWidth='6px' stroke='black' />
            <line x1={pos.x} y1={pos.y}
              x2={p.x + (dx / 4)} y2={p.y + (dy / 4)}
              className='arrow' markerEnd='url(#arrow)' />
            <VolumeIndicator x={pos.x} y={pos.y} r={sr} color={this.color} user={user} />
            <Badge x={pos.x} y={pos.y} user={user} r={r} />
          </g>
        }
      </Motion>
    )
  }

  renderClose (user, volume, x, y) {
    const params = {stiffness: STIFFNESS, damping: DAMPING}
    return (
      <Motion
        defaultStyle={{x: 0, y: 0}}
        style={{x: spring(x, params), y: spring(y, params)}}
      >
        {pos =>
          <g className='user-blob'  id={user.id} >
            <defs>
              {this.renderInsides(user, d)}
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={r} fill={this.fill} strokeWidth='6px' stroke='black' />
            <VolumeIndicator x={pos.x} y={pos.y} r={r} color={this.color} user={user} />
            <Badge x={pos.x} y={pos.y} user={user} r={r} />
          </g>
        }
      </Motion>
    )
  }

  renderInsides (user, d) {
    if (user.avatar && user.avatar != '') {
      return (
        <pattern id={`avatar-${user.id}`} preserveAspectRatio='none' x='0' y='0' height='100%' width='100%' viewBox={`0 0 ${d} ${d}`}>
          <image preserveAspectRatio='none' x='0' y='0' width={d} height={d} xlinkHref={user.avatar}></image>
        </pattern>
      )
    }

    else {
      let initials = user.name.split(' ').map(s => s.charAt(0).toUpperCase()).join('')
      if (initials.length > 2)
        initials = [initials[0], initials[initials.length - 1]]

      const lighter = Color(this.color).alpha(0.5).lighten(0.5)
      const darker = Color(this.color).darken(0.5)

      return (
        <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' viewBox={`0 0 ${d} ${d}`}>
          <rect width={d} height={d} fill={lighter.hslString()} stroke='none' />
          <text x={d/2} y={d/2} textAnchor='middle' stroke={this.color} fontSize={d/2 + 'px'} dy={d == 100 ? 15 : 10} stroke='none' fill={darker.hslString()} >
            {initials}
          </text>
        </pattern>
      )
    }
  }
}

