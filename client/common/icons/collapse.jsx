import { Component, h } from 'preact'
import IconCore from './icon-core'

export default class EditIcon extends Component {
  render (props, state) {
    return (
      <IconCore {...props} >
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
