import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import { Motion, spring } from 'react-motion'
import lineIntersect from 'line-intersect'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 */

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

export default class UserBlob extends React.Component {
  constructor () {
    super()
  }

  render () {
    const { user, idx, translate, isMe } = this.props
    let { x, y } = user

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    const fill = user.avatar ? `url(#avatar-${user.id})` : this.fill

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    if (!isMe && (adj.x < 0 || adj.x > window.screen.width || adj.y < 0 || adj.y > window.screen.height)) {
      return this.renderFar(user, x, y, fill)
    } else {
      return this.renderClose(user, x, y, fill)
    }
  }

  renderFar (user, x, y, fill) {
    const halfW = window.screen.width / 2
    const halfH = window.screen.height / 2
    const walls = {
      left: { start: { x: x - halfW, y: y - halfH }, end: { x: x - halfW, y: y + halfH } },
      right: { start: { x: x + halfW, y: y - halfH }, end: { x: x + halfW, y: y + halfH } },
      top: { start: { x: x - halfW, y: y - halfH }, end: { x: x + halfW, y: y - halfH } },
      bottom: { start: { x: x - halfW, y: y + halfH }, end: { x: x + halfW, y: y + halfH } }
    }

    const center = {x: (walls.left.start.x + walls.right.start.x) / 2, y: (walls.top.start.y + walls.bottom.start.y) / 2}
    const line = {start: center, end: {x, y}}
    const intersects = {
      left: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.left.start.x, walls.left.start.y, walls.left.end.x, walls.left.end.y),
      right: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.right.start.x, walls.right.start.y, walls.right.end.x, walls.right.end.y),
      top: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.top.start.x, walls.top.start.y, walls.top.end.x, walls.top.end.y),
      bottom: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.bottom.start.x, walls.bottom.start.y, walls.bottom.end.x, walls.bottom.end.y)
    }

    let point
    for (let wall in intersects) {
      if (intersects[wall].type == 'intersecting') {
        point = result.point
      }
    }

    const p = {
      x: point.x,
      y: point.y
    }

    return (
      <Motion
        defaultStyle={{x: 0, y: 0, z: 0}}
        style={{x: spring(p.x), y: spring(p.y), z: spring(user,volume || 0, {stiffness: 300, damping: 50})}}
      >
        {pos =>
          <g className='user-blob' id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${sd} ${sd}`}>
                <image x='0' y='0' width={sd} height={sd} xlinkHref={user.avatar}></image>
              </pattern>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={sr} fill={fill} strokeWidth='6px' stroke='black' />
            <path
              transform={`translate(${pos.x},${pos.y})`}
              strokeWidth='6px'
              stroke='red'
              d={d3.svg.arc().innerRadius(r).outerRadius(r+1).startAngle(0).endAngle(pos.z / 20 * Math.PI)()}
             />
          </g>
        }
      </Motion>
    )
  }

  renderClose (user, x, y, fill) {
    return (
      <Motion
        defaultStyle={{x: 0, y: 0, z: 0}}
        style={{x: spring(x), y: spring(y), z: spring(user.volume || 0, {stiffness: 300, damping: 50})}}
      >
        {pos =>
          <g className='user-blob'  id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${d} ${d}`}>
                <image x='0' y='0' width={d} height={d} xlinkHref={user.avatar}></image>
              </pattern>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={r} fill={fill} strokeWidth='6px' stroke='black' />
            <path
              transform={`translate(${pos.x},${pos.y})`}
              strokeWidth='6px'
              stroke='red'
              d={d3.svg.arc().innerRadius(r).outerRadius(r+1).startAngle(0).endAngle(pos.z / 20 * Math.PI)()}
             />
          </g>
        }
      </Motion>
    )
  }
}
