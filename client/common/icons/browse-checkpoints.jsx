import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Checkpoint extends Component {
  render () {
    return (
      <IconCore {...this.props} >
        <g transform='translate(-3, -3)'>
          <path d='M0 0h24v24H0z' fill='none'/>
          <path d='M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z'/>
        </g>
        <g transform='translate(3,3)'>
          <path d='M0 0h24v24H0z' fill='none'/>
          <path d='M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z'/>
        </g>
      </IconCore>
    )
  }
}
