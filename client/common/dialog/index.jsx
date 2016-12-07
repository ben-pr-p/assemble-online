import { Component, h, render } from 'preact'
import Portal from 'preact-portal'

export default class Dialog extends Component {
  render ({title, children, actions}) {
    return (
      <Portal into='body'>
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
      </Portal>
    )
  }
}
