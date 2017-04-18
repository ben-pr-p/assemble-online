import React, { Component } from 'react'
import IconCore from './icon-core'

export default class VideoOn extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
      </IconCore>
    )
  }
}
