import { Component, h } from 'preact'
import { arc } from 'd3-shape'
import dom from 'component-dom'
import Boss from '../../lib/boss'

const MAX_VOLUME = 10
const NUM_CIRCLES = 10

export default class VolumeIndicator extends Component {
  counter = NUM_CIRCLES - 1

  componentWillMount () {
    Boss.on(`volume-${this.props.user.id}`, this.handleVolume, `volume-${this.props.user.id}`)
  }

  componentWillUnmount () {
    Boss.offAllByCaller(`volume-${this.props.user.id}`)
  }

  handleVolume = (vol) => {
    this.counter = this.counter + 1
    dom(`#v-${this.counter % NUM_CIRCLES}`).css('transform', `scale(${1 + vol/MAX_VOLUME})`)
    dom(`#v-${(this.counter - (NUM_CIRCLES / 2)) % NUM_CIRCLES}`).css('transform', `scale(1)`)
  }

  render ({x, y, d, color}) {
    return (
      <div className='volume-conatiners'>
        {new Array(NUM_CIRCLES).fill(null).map((nil, idx) => (
          <div key={idx} id={`v-${idx}`}
            className='volume-indicator'
            style={{
              width: `${d}px`,
              height: `${d}px`,
              border: `2px solid ${color}`
            }}
          />
        ))}
      </div>
    )
  }
}
