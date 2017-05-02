import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Download extends Component {
  render () {
		const props = this.props

    return (
      <IconCore {...props} >
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
