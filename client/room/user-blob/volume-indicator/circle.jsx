import React, { Component } from 'react'
import Updates from '../../../lib/updates'
import { MAX_VOLUME, BORDER_THICKNESS } from './vol-consts'

export default class Circle extends Component {
  state = {
    vol: 0,
    filler: false
  }

  componentWillMount () {
    Updates.on(`volume-${this.props.user.id}`, this.handleVolume)
  }

  componentWillUnmount () {
    Updates.off(`volume-${this.props.user.id}`, this.handleVolume)
  }

  handleVolume = raw => {
    const vol = Math.min(raw / MAX_VOLUME, 1)
    this.setState({vol})
  }

  render () {
		const { x, y, d, user, status } = this.props
		const { vol, filler } = this.state

    return (
      <div className='volume-circle'>

        <div className='spinner circle'
          style={{
            width: `${d}px`,
            height: `${d}px`,
            borderTop: `${BORDER_THICKNESS}px solid ${user.color}`,
            borderLeft: `${BORDER_THICKNESS}px solid ${user.color}`,
            borderRight: `${BORDER_THICKNESS}px solid black`,
            borderBottom: `${BORDER_THICKNESS}px solid black`,
            borderRadius: '50%',
            zIndex: 100,
            transform: `rotate(${this.calcRotate(vol)}deg)`
          }}
        />

        <div className='circle'
          style={{
            width: `${d/2}px`,
            height: `${d}px`,
            border: `${BORDER_THICKNESS}px solid black`,
            borderRight: 0,
            borderRadius: `${d + BORDER_THICKNESS}px 0px 0px ${d + BORDER_THICKNESS}px`,
            zIndex: 110,
            opacity: vol > .5
              ? 0
              : 1
          }}
        />

        <div className='circle'
          style={{
            width: `${d/2}px`,
            height: `${d}px`,
            border: `${BORDER_THICKNESS}px solid ${user.color}`,
            borderLeft: 0,
            left: `${d/2}px`,
            borderRadius: `0px ${d + BORDER_THICKNESS}px ${d + BORDER_THICKNESS}px 0px`,
            zIndex: 110,
            opacity: vol > .5
              ? 1
              : 0
          }}
        />
      </div>
    )
  }

  calcRotate = vol => -45 + (vol * 360)
}
