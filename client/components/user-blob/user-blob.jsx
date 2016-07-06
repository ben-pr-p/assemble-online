import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import { Motion, spring } from 'react-motion'

/*
 * Motion in this component is modeled off of https://github.com/chenglou/react-motion/blob/master/demos/demo1-chat-heads/Demo.jsx
 */

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

    return (
      <Motion
        defaultStyle={{x: 0, y: 0}}
        style={{x: spring(x), y: spring(y)}}
      >
        {pos => 
          <g className='user-blob'  id={user.id}>
            <circle transform={`translate(${pos.x},${pos.y})`} r='50' fill={this.fill} ref='circle' />
            <text x='-35' y='60' text-anchor="middle" transform={`translate(${pos.x},${pos.y})`} stroke="#51c5cf" stroke-width="2px" dy=".3em">{user.name}</text>
          </g>
        }
      </Motion>
    )
  }
}
