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

  componentWillMount () {
    this.fill = d3.scale.category20()(this.props.idx)
  }

  render () {
    const { user, idx } = this.props
    const { x, y } = user

    const fill = user.avatar ? `url(#avatar-${user.id})` : this.fill

    return (
      <Motion
        defaultStyle={{x: 0, y: 0}}
        style={{x: spring(x), y: spring(y)}}
      >
        {pos => 
          <g className='user-blob'  id={user.id} >
            <defs>
              <pattern id={`avatar-${user.id}`} x='0' y='0' height='100%' width='100%' height='1' width='1' viewBox={`0 0 ${d} ${d}`}>
                <image x='0' y='0' width={d} height={d} xlinkHref={user.avatar}></image>
              </pattern>
            </defs>
            <circle transform={`translate(${pos.x},${pos.y})`} r={r} fill={fill} strokeWidth='5px' stroke={this.fill} />
            <text className='name-text' x='-40' y={r + 15} text-anchor='middle' transform={`translate(${pos.x},${pos.y})`} >{user.name}</text>
          </g>
        }
      </Motion>
    )
  }
}
