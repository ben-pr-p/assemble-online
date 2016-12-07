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

  onMouseDown = () => this.setState({dragging: true})
  onMouseUp = () => this.setState({dragging: false})

  onDocMouseMove = (ev) => this.state.dragging
    ? this.setState({pos: {
        x: this.state.pos.x + ev.movementX,
        y: this.state.pos.y + ev.movementY
      }})
    : null

  toggleCollapsed = () => this.setState({ collapsed: !this.state.collapsed })
  toggleDocked = () => this.setState({ docked: !this.state.docked })

  render (props, {docked}) {
    return docked ? this.renderDocked() : this.renderWindow()
  }

  renderDocked () {
    const firstLetter = this.props.title.charAt(0).toUpperCase()

    return (
      <a className='window-docked'
        onClick={this.toggleDocked}
        style={{left: `${220 + this.props.idx * 50}px`}}
      >
        {firstLetter}
      </a>
    )
  }

  renderWindow () {
    const { children, title } = this.props
    const { pos, collapsed, dragging } = this.state
    const style = {
      transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`
    }

    if (collapsed)
      style.height = 20

    return (
      <div className={`window ${dragging ? 'dragging' : ''}`} style={style}>
        <div className='window-header'
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove} onMouseLeave={this.onMouseLeave}
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
            <IconButton onClick={this.toggleDocked}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        {!collapsed && children}
      </div>
    )
  }
}