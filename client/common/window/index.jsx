import { Component, h } from 'preact'
import IconButton from '../icon-button'
import CloseIcon from '../icons/close'
import ExpandIcon from '../icons/expand'
import CollapseIcon from '../icons/collapse'

export default class Window extends Component {
  state = {
    pos: {x: 100, y: 100},
    collapsed: false,
    docked: false,
    dragging: false
  }

  componentDidMount () {
    document.addEventListener('mousemove', this.onDocMouseMove)
  }

  componentWillUnmount () {
    document.removeEventListener('mousemove', this.onDocMouseMove)
  }
  
  render ({children, title, pos, dragging, size}) {
    const style = {
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`
    }

    if (collapsed)
      style.height = 20

    return (
      <div className={`window ${dragging ? 'dragging' : ''}`} style={style}>
        <div className='window-header'
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp}
        >
          <div className='window-title'>
            {title}
          </div>
        </div>
        {children}
      </div>
    )
  }
}
