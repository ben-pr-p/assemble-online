import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Left extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
        <path d="M0-.5h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
