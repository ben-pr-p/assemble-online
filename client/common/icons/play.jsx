import { h } from 'preact'
import IconCore from './icon-core'

export default class AccountBox {
  render (props) {
    return (
      <IconCore {...props} >
        <path d="M8 5v14l11-7z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </IconCore>
    )
  }
}
