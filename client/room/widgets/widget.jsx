/*
 * Widget interface –
 * - can be move
 * - can be removed
 * - renders a child width that has access to the data
 * - can have restricted visibility (only to some users)
 */

import { Component, h } from 'preact'

export default class Widget extends Component {
  state = {
    coords: {x: 0, y: 0}
  }
  
  close = () => this.props.close()

  moveTo = (coords) => this.setState({coords})

  render () {
    return (
      <g>
      </g>
    )
  }
}
