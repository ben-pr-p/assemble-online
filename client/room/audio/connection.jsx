import React from 'react'
import Boss from '../../lib/boss'

export default class AudioConnection extends React.Component {
  constructor () {
    super()

    this.handleDistance = this.handleDistance.bind(this)
  }

  componentWillMount () {
    const {easyrtcid} = this.props
    Boss.on(`distance-to-${easyrtcid}`, this.handleDistance, `connection-to-${this.props.easyrtcid}`)
  }

  componentWillUnmount () {
    const {easyrtcid} = this.props
    Boss.offAllByCaller(`distance-to-${easyrtcid}`)
  }

  componentDidMount () {
    easyrtc.setVideoObjectSrc(this.refs.root, this.props.stream)
  }

  handleDistance (dist) {
    this.refs.root.volume = this.calcVolume(dist)
  }

  calcVolume (d) {
    let v = Math.min(1 / (Math.pow(d - 70, 2) / 5000), 1)
    if (typeof v == 'number' && !isNaN(v)) {
      return v
    } else {
      return 0
    }
  }

  render () {
    return (
      <video key={this.props.easyrtcid} autoPlay='' width='0' height='0' ref='root' />
    )
  }
}
