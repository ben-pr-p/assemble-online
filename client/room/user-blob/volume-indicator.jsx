import React from 'react'
import {Motion, spring} from 'react-motion'
import d3 from 'd3'
import Boss from '../../lib/boss'

export default class VolumeIndicator extends React.Component {
  constructor () {
    super()
    this.state = {
      volume: 0
    }

    this.handleVolume = this.handleVolume.bind(this)
  }

  componentWillMount () {
    Boss.on(`volume-${this.props.user.id}`, this.handleVolume, `volume-${this.props.user.id}`)
  }

  componentWillUnmount () {
    Boss.offAllByCaller(`volume-${this.props.user.id}`)
  }

  handleVolume (vol) {
    this.setState({
      volume: vol
    })
  }

  render () {
    const {volume} = this.state
    const {x, y, z, r, color} = this.props

    return (
      <Motion
        defaultStyle={{z:0}}
        style={{z: spring(volume, {stiffness: 500, damping: 50})}}
      >
        {v =>
          <path
            transform={`translate(${x},${y})`}
            strokeWidth='6px'
            stroke={color}
            d={d3.svg.arc().innerRadius(r).outerRadius(r+1).startAngle(0).endAngle(v.z / 20 * Math.PI)()}
          />
        }
      </Motion>
    )
  }
}
