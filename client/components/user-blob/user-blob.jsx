import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import { Motion, spring } from 'react-motion'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 */

const r = 50
const d = r * 2

export default class UserBlob extends React.Component {
  constructor () {
    super()
  }

  render () {
    const { user, idx } = this.props
    const { x, y } = user

    const fill = user.avatar ? `url(#avatar-${user.id})` : this.fill

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
            <text className='name-text' x='-40' y={r + 15} text-anchor='middle' transform={`translate(${pos.x},${pos.y})`} >{user.name}</text>
          </g>
        }
      </Motion>
    )
  }
}
