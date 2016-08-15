import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import { Motion, spring } from 'react-motion'
import lineIntersect from 'line-intersect'
import Boss from '../../lib/boss'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 * TO DO: ADD ARROWS
 */

const STIFFNESS = 241
const DAMPING = 10

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

const colorScale = d3.scale.ordinal().range(['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6'])

export default class UserBlob extends React.Component {
  constructor () {
    super()
    this.state = {
      showCard: false
    }
  }

  render () {
    const {user, location, volume, idx, translate, me, isMe} = this.props
    let { x, y } = location

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    this.fill = `url(#avatar-${user.id})`
    this.color = colorScale(this.props.idx)

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
        p= intersects[wall].point
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

    return (
      <Motion
        defaultStyle={{x: 0, y: 0, z: 0}}
        style={{x: spring(p.x + dx, params), y: spring(p.y + dy, params), z: spring(volume || 0, {stiffness: 300, damping: 50})}}
      >
        {pos =>
          <g className='user-blob offscreen' id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${sd} ${sd}`}>
                <image x='0' y='0' width={sd} height={sd} xlinkHref={user.avatar}></image>
              </pattern>
              <marker id='arrow' viewBox='0 -5 10 10' refX='5' refY='0' markerWidth='20' markerHeight='16' orient='auto'>
                <path d='M0,-5L10,0L0,5' className='arrowHead' stroke={this.color} fill={this.color} />
              </marker>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={sr} fill={this.fill} strokeWidth='6px' stroke='black' />
            <line x1={pos.x} y1={pos.y}
              x2={p.x + (dx / 4)} y2={p.y + (dy / 4)}
              className='arrow' markerEnd='url(#arrow)' />
            <path
              transform={`translate(${pos.x},${pos.y})`}
              strokeWidth='6px'
              stroke={this.color}
              d={d3.svg.arc().innerRadius(sr).outerRadius(sr+1).startAngle(0).endAngle(pos.z / 20 * Math.PI)()}
             />
          </g>
        }
      </Motion>
    )
  }

  renderClose (user, volume, x, y) {
    const params = {stiffness: STIFFNESS, damping: DAMPING}

    return (
      <Motion
        defaultStyle={{x: 0, y: 0, z: 0}}
        style={{x: spring(x, params), y: spring(y, params), z: spring(volume || 0, {stiffness: 300, damping: 50})}}
      >
        {pos =>
          <g className='user-blob'  id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${d} ${d}`}>
                <image x='0' y='0' width={d} height={d} xlinkHref={user.avatar}></image>
              </pattern>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={r} fill={this.fill} strokeWidth='6px' stroke='black' />
            <path
              transform={`translate(${pos.x},${pos.y})`}
              strokeWidth='6px'
              stroke={this.color}
              d={d3.svg.arc().innerRadius(r).outerRadius(r+1).startAngle(0).endAngle(pos.z / 20 * Math.PI)()}
             />
          </g>
        }
      </Motion>
    )
  }
}
