import React, { Component } from 'react'
import joinClass from '../join-class'
import { Camera, Question } from '../icons'

export default class Avatar extends Component {
  state = {
    failedImg: false
  }

  receiveRef = (ref) => this.img = ref
  componentDidMount () { this.checkFailedImg() }
  componentDidUpdate () { this.checkFailedImg() }

  checkFailedImg = () => this.img && !this.img.complete
    ? this.setState({ failedImg: true })
    : null

  render () {
    const { form, src, letters, className, questionMark, ...others } = this.props
    const { failedImg } = this.state

    const imageSuccess = src && !failedImg
    const Src = src

    return (
      <div {...{
        ...others,
        className: joinClass(className, `avatar ${!form ? 'blob' : 'form'}`),
        style: { backgroundImage: imageSuccess ? `url("${src}")` : 'none' }
      }}>
        {imageSuccess
          ? ( <img src={src} ref={this.receiveRef} style={{ display: 'none' }} /> )
          : (
              <span className='avatar-letters'>
                {(letters && letters != '')
                  ? (
                      <h3>
                        {Array.isArray(letters) ? letters.join('') : letters.toString()}
                      </h3>
                    )
                  : questionMark
                    ? <Question />
                    : <Camera/>
                }
              </span>
            )
        }
      </div>
    )
  }
}
