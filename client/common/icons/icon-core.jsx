import React, { Component } from 'react'
import joinClass from '../join-class'

export default class IconCore extends Component {
  render () {
		const {children, className, color, style} = this.props
		const state = this.state

    return (
      <svg
        className={joinClass(className, 'icon-core')}
        style={{fill: color, ...style}}
      >
        {children}
      </svg>
    )
  }
}
