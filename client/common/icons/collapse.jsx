import React, { Component } from 'react'
import IconCore from './icon-core'

export default class EditIcon extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
