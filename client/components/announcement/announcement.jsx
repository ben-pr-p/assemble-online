import React from 'react'

export default class Announcement extends React.Component {
  constructor () {
    super()
    this.state = {
      hidden: true,
      opaque: true
    }
  }

  componentWillMount () {
    setTimeout(this.flyAndFade.bind(this), 10)
  }

  flyAndFade () {
    this.flyIn()
    setTimeout(this.fadeOut.bind(this), 5000)
  }

  flyIn () {
    this.setState({hidden: false})
  }

  fadeOut () {
    this.setState({opaque: false})
  }

  render () {
    const { text } = this.props
    const { hidden, opaque } = this.state

    let c_ac = ''
    let c_a = ''
    if (hidden) c_ac = 'hidden'
    if (opaque) c_a = 'opaque'

    return (
      <div className={`announcement-container ${c_ac}`}>
        <div className={`announcement ${c_a}`}>
          {text}
        </div>
      </div>
    )
  }
}
