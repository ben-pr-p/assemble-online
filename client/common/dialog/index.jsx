import { Component, h, render } from 'preact'
import dom from 'component-dom'

export default class Dialog extends Component {
  node = null

  componentDidMount () {
    const {title, children, actions} = this.props

    render((
      <div className='whole-screen'>
        <div className='dialog'>
          <h1>
            {title}
          </h1>
          {children}
          {actions}
        </div>
      </div>
    ), document.body)
  }

  componentWillUnMount () {
    dom('whole-screen').remove()
  }

  render () {
    return <div className='dialog-bridge' />
  }
}
