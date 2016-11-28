import { Component, h } from 'preact'
import joinClass from '../join-class'

export default class Avatar extends Component {
  state = {
    failedImg: false
  }

  receiveRef = (ref) => this.img = ref

  componentDidMount () {
    if (this.img && !this.img.complete)
      this.setState({ failedImg: true })
  }

  render ({src, letters, className, ...others}, {failedImg}) {
    return (
      <div className={joinClass(className, 'avatar')} {...others} >
        {src && !failedImg
          ? <img src={src} ref={this.receiveRef} />
          : <span className='avatar-letters'> {letters.toString()} </span>
        }
      </div>
    )
  }
}
