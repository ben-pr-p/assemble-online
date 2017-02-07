import { h, Component } from 'preact'
import joinClass from '../join-class'

export default class IconCore extends Component {
  render ({children, className, color}, state) {
    return (
      <svg
        className={joinClass(className, 'icon-core')}
        style={{fill: color}}
      >
        {children}
      </svg>
    )
  }
}
