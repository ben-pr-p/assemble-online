import { h, Component } from 'preact'
import joinClass from '../join-class'

export default class IconCore extends Component {
  render ({children, className, color, style}, state) {
    return (
      <svg
        className={joinClass(className, 'icon-core')}
        style={{fill: color, ...style}}
      >
        {children}
      </svg>
    )
  }
}
