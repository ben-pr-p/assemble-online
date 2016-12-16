/*
 * Widget composer aid –
 * config options:
 *   spatial: defaut = false
 *     if spatial widget
 *       it has coordinates and size in the room
 *       those coordinates and size are shared and equivalent among all users
 *       can be moved and resize
 *   allowance: default = 1
 *       the number of widgets of this type that can coexist
 *       must be a number, `Infinity` is fine
 */

import { ToPeers, FromPeers } from '../../lib/emitters'

const configDoMove = config => config.spatial
  ? function (ev) {
      ToPeers.emit('to-all', {
        event: this.eventPrefix,
        data: {pos: {
          x: this.state.x + ev.movementX,
          y: this.state.y + ev.movementY
        }}
      })
    }
  : function (ev) {
      this.setState({pos: {
        x: this.state.x + ev.movementX,
        y: this.state.y + ev.movementY
      }})
    }

export default config => component => {
  component.eventPrefix = `widget-${this.name}`
  /*
   * Render
   */
  const previousRender = component.render
  component.render = function (props, {pos, size}) {
    return (
      <Window title={this.title}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
      >
        {previousRender()}
      </Window>
    )
  }.bind(component)

  /*
   * Handle mouse dragging
   */
  component.onMouseDown = function () {
    this.setState({dragging: true})
  }.bind(component)

  component.onMouseUp = function () {
    this.setState({dragging: false})
  }.bind(component)

  component.doMove = configDoMove(config).bind(component)

  /*
   * Did Mount, Will Unmount
   */
  const previousDidMount = component.componentDidMount
  component.componentDidMount = function () {
    document.addEventListener('mousemove', this.doMove)
    previousDidMount()
  }.bind(component)

  const previousWillUnmount = component.componentWillUnmount
  component.componentWillUnmount = function () {
    document.removeEventListener('mousemove', this.doMove)
    previousWillUnmount()
  }.bind(component)

  /*
   * Communicate with other peers
   */
  component.sendToAll = function (data) {
    ToPeers.emit('to-all', {
      event: this.eventPrefix,
      data: data
    })
  }.bind(component)

  FromPeers.on(this.eventPrefix, function (stateChange) {
    this.setState(stateChange)
  }.bind(component))
}
