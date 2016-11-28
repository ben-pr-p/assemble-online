import { Component, h } from 'preact'
import PhoneIcon from '../../common/icons/phone'

export default class ConnectionStatus extends Component {

  state = {
    msg: {code: null, text: null},
    shown: false,
    queue: []
  }

  prevMsg = null

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
    setTimeout(this.tick, duration)
  }

  timeoutFade () {
    setTimeout(() => {
      this.setState({shown: false})
      setTimeout(() => {
        this.setState({msg: null})
      }, 1000)
    }, 1000)
  }

  tick = () => {
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

  render (props, {msg, shown}) {
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
