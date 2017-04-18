import React, { Component } from 'react'
import IconCore from './icon-core'

export default class EditIcon extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
