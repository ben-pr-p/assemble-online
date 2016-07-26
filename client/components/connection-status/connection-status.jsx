import React from 'react'
import PhoneIcon from 'material-ui/svg-icons/action/settings-phone'

export default class extends React.Component {
  constructor () {
    super()

    this.state = {
      msg: {code: null, text: null},
      shown: false,
      queue: []
    }

    this.prevMsg = null
  }

  componentWillMount () {
    this.state.msg = this.props.msg
    if (this.state.msg)
      this.state.shown = true
  }

  componentWillReceiveProps (nextProps) {
    let { msg } = nextProps
    if (msg && msg.code != this.prevMsg.code) {
      this.state.shown = true
      console.log('Received new msg %s', msg.text)

      this.state.queue.push(msg)
      if (this.state.queue.length == 1)
        this.timeoutTick(200)
    }
  }

  timeoutTick (duration) {
    setTimeout(this.tick.bind(this), duration)
  }

  timeoutFade () {
    setTimeout(() => {
      this.setState({shown: false})
      setTimeout(() => {
        this.setState({msg: null})
      }, 1000)
    }, 1000)
  }

  tick () {
    let msg = this.state.queue.shift()
    this.setState({msg})

    if (this.state.queue.length > 1) {
      this.timeoutTick(200)
    } else if (this.state.queue.length > 0) {
      this.timeoutTick(1000)
    } else {
      this.timeoutFade()
    }
  }

  render () {
    const { msg, shown } = this.state
    const shownClass = (shown) ? 'shown' : 'hidden'

    if (msg)
      this.prevMsg = msg

    return (
      <div className={`connection-status ${shownClass}`}>
        <PhoneIcon color={'black'} style={{height: '50px', width: '50px'}} />
        <div className='connection-msg-container'>
          {msg ? msg.text : ''}
        </div>
      </div>
    )
  }
}
