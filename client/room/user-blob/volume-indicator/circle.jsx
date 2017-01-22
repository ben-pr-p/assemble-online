import { Component, h } from 'preact'
import Updates from '../../../lib/updates'
import {MAX_VOLUME, BORDER_THICKNESS} from './vol-consts'

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

  render ({x, y, d, user, status}, {vol, filler}) {
    return (
      <div className='volume-circle'>

        <div className='spinner circle'
          style={{
            width: `${d}px`,
            height: `${d}px`,
            'border-top': `${BORDER_THICKNESS}px solid ${user.color}`,
            'border-left': `${BORDER_THICKNESS}px solid ${user.color}`,
            'border-right': `${BORDER_THICKNESS}px solid black`,
            'border-bottom': `${BORDER_THICKNESS}px solid black`,
            'border-radius': '50%',
            'z-index': 100,
            transform: `rotate(${this.calcRotate(vol)}deg)`
          }}
        />

        <div className='circle'
          style={{
            width: `${d/2}px`,
            height: `${d}px`,
            border: `${BORDER_THICKNESS}px solid black`,
            'border-right': 0,
            'border-radius': `${d + BORDER_THICKNESS}px 0px 0px ${d + BORDER_THICKNESS}px`,
            'z-index': 110,
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
            'border-left': 0,
            left: `${d/2 + BORDER_THICKNESS}px`,
            'border-radius': `0px ${d + BORDER_THICKNESS}px ${d + BORDER_THICKNESS}px 0px`,
            'z-index': 110,
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
