import React from 'react'
import d3 from 'd3'

export default class UserBlob extends React.Component {
  constructor () {
    super()
  }

  render () {
    const { user, idx } = this.props
    let fill = d3.scale.category20(idx)

    return (
      <g className='user-blob' id={user.id}>
        <circle cx={user.x} cy={user.y} r='50' fill={fill} />
      </g>
    )
  }
}
