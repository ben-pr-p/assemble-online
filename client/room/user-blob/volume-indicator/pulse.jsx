import { Component, h } from 'preact'
import Updates from '../../../lib/updates'

const MAX_VOLUME = 10
const NUM_CIRCLES = 20
const BORDER_THICKNESS = 3

export default class Pulse extends Component {
  counter = NUM_CIRCLES - 1

  componentWillMount () {
    Updates.on(`volume-${this.props.user.id}`, this.handleVolume)
  }

  componentWillUnmount () {
    Updates.off(`volume-${this.props.user.id}`, this.handleVolume)
  }

  handleVolume = (vol) => {
    this.counter = this.counter + 1

    const curr = document.querySelector(`#v-${this.props.user.id}-${this.counter % NUM_CIRCLES}`)
    curr.style.transform = `scale(${1 + vol/MAX_VOLUME})`
    curr.classList.add('animatable')

    const prev = document.querySelector(`#v-${this.props.user.id}-${(this.counter - (NUM_CIRCLES / 2)) % NUM_CIRCLES}`)
    prev.style.transform = 'scale(1)'
    prev.classList.remove('animatable')
  }

  render ({x, y, d, user, status}) {
    return (
      <div className='volume-conatiners'>
        {new Array(NUM_CIRCLES).fill(null).map((nil, idx) => (
          <div key={idx} id={`v-${this.props.user.id}-${idx}`}
            className='volume-indicator-wrapper'
            style={{ width: `${d - BORDER_THICKNESS}px`, height: `${d - BORDER_THICKNESS}px`}}
          >
            <div className={`volume-indicator ${status == 'connecting' ? 'rotating' : ''}`}
              style={this.computeBorderStyle(user.color, status)}
            />
          </div>
        ))}
      </div>
    )
  }

  computeBorderStyle (color, status) {
    const greyBorder = `${BORDER_THICKNESS}px solid grey`
    if (status == 'disconnected')
      return {border: greyBorder}

    const colorBorder = `${BORDER_THICKNESS}px solid ${color}`
    if (status == 'connected')
      return {border: colorBorder}

    const styles = {}
    styles['border-top'] = colorBorder
    styles['border-right'] = greyBorder
    styles['border-left'] = greyBorder
    styles['border-bottom'] = greyBorder
    return styles
  }
}
