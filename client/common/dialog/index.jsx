import { Component, h, render } from 'preact'
import { Modal } from 'antd'

export default class Dialog extends Component {
  render () {
    const {title, children, actions} = this.props

    return (
      <Modal>
        <div className='whole-screen'>
          <div className='dialog'>
            <h1>
              {title}
            </h1>
            <div className='children-container'>
              {children}
            </div>
            <div className='actions-container'>
              {actions}
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}
