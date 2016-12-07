import { Component, h } from 'preact'
import joinClass from '../join-class'

export default class Avatar extends Component {
  state = {
    failedImg: false
  }

  shouldComponentUpdate () {
    this.state.failedImg = false
  }

  receiveRef = (ref) => this.img = ref
  componentDidMount () { this.checkFailedImg() }
  componentDidUpdate () { this.checkFailedImg() }

  checkFailedImg = () => this.img && !this.img.complete
    ? this.setState({failedImg: true})
    : null

  render ({form, src, letters, className, ...others}, {failedImg}) {
    const imageSuccess = src && !failedImg

    return (
      <div {...{
          ...others,
          className: joinClass(className, `avatar ${!form ? 'blob' : 'form'}`),
          style: {backgroundImage: imageSuccess ? `url("${src}")` : 'none'}
        }}
      >
        {imageSuccess
          ? (
              <img src={src} ref={this.receiveRef} style={{display: 'none'}} />
            )
          : (
              <span className='avatar-letters'>
                {letters && letters != '' ? letters.toString() : '?'}
              </span>
            )
        }
      </div>
    )
  }
}
