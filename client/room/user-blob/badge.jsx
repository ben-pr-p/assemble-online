import React from 'react'
import {Motion, spring} from 'react-motion'
import {icons} from '../common/response-options/response-options'
import Paper from 'material-ui/Paper'

export default class VolumeIndicator extends React.Component {
  constructor () {
    super()
  }

  render () {
    const {x, y, user, r} = this.props

    let contents
    if (user.badge) {
      contents = (
        <foreignObject width='30' height='30'>
          <Paper zDepth={3} circle={true} className='badge-container' >
            {icons[user.badge]}
          </Paper>
        </foreignObject>
      )
    }

    return (
      <g transform={`translate(${x+(r/2)},${y+(r/2)})`} >
        {contents}
      </g>
    )
  }
}
