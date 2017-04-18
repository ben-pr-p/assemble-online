import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Checkpoint extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </IconCore>
    )
  }
}
