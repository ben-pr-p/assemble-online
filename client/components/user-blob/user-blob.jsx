import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import { Motion, spring } from 'react-motion'
import lineIntersect from 'line-intersect'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 * TO DO: ADD ARROWS
 */

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

const colorScale = d3.scale.ordinal().range(['#01df00', '#daff02', '#fe6634', '#008e82', '#00cfe2', '#fb0528', '#9b6304', '#532696', '#b53284', '#ff7ba6'])

export default class UserBlob extends React.Component {
  constructor () {
    super()
  }

  render () {
    const { user, idx, translate, me } = this.props
    let { x, y } = user

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    this.fill = `url(#avatar-${user.id})`
    this.color = colorScale(this.props.idx)

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    if (!(user.id == me.id) && (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight)) {
      return this.renderFar(user, x, y, me)
    } else {
      return this.renderClose(user, x, y)
    }
  }

  renderFar (user, x, y, me) {
    const halfW = window.innerWidth / 2
    const halfH = window.innerHeight / 2
    const walls = {
      left: { start: { x: me.x - halfW, y: me.y - halfH }, end: { x: me.x - halfW, y: me.y + halfH } },
      right: { start: { x: me.x + halfW, y: me.y - halfH }, end: { x: me.x + halfW, y: me.y + halfH } },
      top: { start: { x: me.x - halfW, y: me.y - halfH }, end: { x: me.x + halfW, y: me.y - halfH } },
      bottom: { start: { x: me.x - halfW, y: me.y + halfH }, end: { x: me.x + halfW, y: me.y + halfH } }
    }

    const line = {start: {x: me.x, y: me.y} , end: {x, y}}
    const intersects = {
      left: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.left.start.x, walls.left.start.y, walls.left.end.x, walls.left.end.y),
      right: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.right.start.x, walls.right.start.y, walls.right.end.x, walls.right.end.y),
      top: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.top.start.x, walls.top.start.y, walls.top.end.x, walls.top.end.y),
      bottom: lineIntersect.checkIntersection(line.start.x, line.start.y, line.end.x, line.end.y, walls.bottom.start.x, walls.bottom.start.y, walls.bottom.end.x, walls.bottom.end.y)
    }

    let point, intersectingWall
    for (let wall in intersects) {
      if (intersects[wall].type == 'intersecting') {
        point = intersects[wall].point
        intersectingWall = wall
      }
    }

    if (!point) return (<div> </div>)

    let dx, dy
    switch (intersectingWall) {
      case 'left':
        dx = 2 * sr
        dy = 0
        break

      case 'right':
        dx = (-1) * sr
        dy = 0
        break

      case 'top':
        dx = 0
        dy = 3 * sr
        break

      case 'bottom':
        dx = 0
        dy = (-4) * sr
        break
    }

    const p = {
      x: point.x + dx,
      y: point.y + dy
    }

    return (
      <Motion
        defaultStyle={{x: 0, y: 0, z: 0}}
        style={{x: spring(p.x), y: spring(p.y), z: spring(user.volume || 0, {stiffness: 300, damping: 50})}}
      >
        {pos =>
          <g className='user-blob offscreen' id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${sd} ${sd}`}>
                <image x='0' y='0' width={sd} height={sd} xlinkHref={user.avatar}></image>
              </pattern>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={sr} fill={this.fill} strokeWidth='6px' stroke='black' />
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

  renderClose (user, x, y) {
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
