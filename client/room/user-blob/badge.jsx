import React, { Component } from 'react'
import { icons } from '../common/response-options/response-options'

export default class Badge extends Component {
  render () {
    const {x, y, user, r} = this.props

    return (
      <g transform={`translate(${x+(r/2)},${y+(r/2)})`} >
        {user.badge
          ? <foreignObject width='30' height='30'>
              <div className='badge-container' >
                {icons[user.badge]}
              </div>
            </foreignObject>
          : null
        }
      </g>
    )
  }
}
