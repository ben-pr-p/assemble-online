import { Component, h } from 'preact'
import IconButton from '../icon-button'
import CloseIcon from '../icons/close'
import ExpandIcon from '../icons/expand'
import CollapseIcon from '../icons/collapse'

export default class Window extends Component {
  state = {
    pos: {x: 100, y: 100},
    collapsed: false
  }

  mouseDown = false

  onMouseDown = () => this.mouseDown = true
  onMouseUp = () => this.mouseDown = false

  onMouseMove = (ev) => this.mouseDown
    ? this.setState({pos: {
        x: this.state.pos.x + ev.movementX,
        y: this.state.pos.y + ev.movementY
      }})
    : null

  onMouseLeave = () => this.mouseDown = false

  toggleCollapsed = () => this.setState({ collapsed: !this.state.collapsed })

  render ({children, closeMe, title}, {pos, collapsed}) {
    const style = {
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`
    }

    if (collapsed)
      style.height = 20

    return (
      <div className='window' style={style}>
        <div className='window-header'
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onMouseLeave}
        >
          <div className='window-title'>
            {title}
          </div>
          <div className='close-window'>
            <IconButton onClick={this.toggleCollapsed} >
              {collapsed
                ? <ExpandIcon />
                : <CollapseIcon />
              }
            </IconButton>
            <IconButton onClick={closeMe}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        {!collapsed && children}
      </div>
    )
  }
}
