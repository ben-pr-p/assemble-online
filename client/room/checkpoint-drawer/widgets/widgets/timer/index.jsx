import { Component, h } from 'preact'
import { Timer } from '../../../../../common/icons'

export default class TimerWidget extends Component {
  static icon = (<Timer style={{transform: 'scale(2)'}} />)
  static kind = 'Timer'
  static initial = {
    minutes: 10,
    seconds: 0
  }

  componentWillMount () {
    this.countDown()
  }

  intervalId = null

  countDown = () => this.intervalId = setInterval(() =>
    this.props.minutes == 0 && this.props.seconds == 0
      ? (clearInterval(this.intervalId), intervalId = null)
      : this.props.seconds == 0
        ? this.props.update({
            minutes: this.props.minutes - 1,
            seconds: 59
          })
        : this.props.update({
            seconds: this.props.seconds - 1
          })
  , 1000)

  setTime = ev => this.update({
    minutes: 5,
    seconds: 0
  })

  render ({minutes, seconds}) {
    return (
      <div className='timer'>
        <div className='minutes'> {minutes} </div>
        <div className='colon'> : </div>
        <div className='seconds'> {
          seconds.toString().length == 1
            ? `0${seconds}`
            : seconds.toString()
        } </div>
      </div>
    )
  }
}
