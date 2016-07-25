import React from 'react'
import PhoneIcon from 'material-ui/svg-icons/action/settings-phone'

export default class extends React.Component {
  constructor () {
    super()

    this.state = {
      msg: null,
      queue: []
    }
  }

  componentWillMount () {
    this.state.msg = this.props.msg
  }

  componentWillReceiveProps (nextProps) {
    let { msg } = nextProps
    this.state.queue.push(msg)
    if (this.state.queue.length == 1)
      this.timeoutTick()
  }

  timeoutTick () {
    setTimeout(this.tick.bind(this), 1000)
  }

  tick () {
    let msg = this.state.queue.shift()
    this.setState({msg})

    if (this.state.queue.length > 1) {
      this.timeoutTick()
    }
  }

  render () {
    const { msg } = this.state
    const shownClass = (msg != null) ? 'shown' : 'hidden'

    return (
      <div className={`connection-status ${shownClass}`}>
        <PhoneIcon />
        <div className='connection-msg-container'>
          {msg}
        </div>
      </div>
    )
  }
}
