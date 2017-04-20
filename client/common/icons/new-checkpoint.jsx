import React, { Component } from 'react'
import IconCore from './icon-core'

export default class Checkpoint extends Component {
  render () {
    return (
      <IconCore>
        <g transform='translate(5,0)'>
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </g>
        <g transform='translate(-5,0)scale(0.8)'>
          <path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/>
          <path d='M0 0h24v24H0z' fill='none'/>
        </g>
      </IconCore>
    )
  }
}
