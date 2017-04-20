import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Checkpoint extends Component {
  render () {
		const props = this.props
		const state = this.state

    return (
      <IconCore {...props} >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
      </IconCore>
    )
  }
}
