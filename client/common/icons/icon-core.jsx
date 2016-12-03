import { h, Component } from 'preact'
import joinClass from '../join-class'

export default class IconCore extends Component {
  render (props, state) {
    <svg classname={joinClass(props.className, 'icon-core')} style={{fill: props.color || 'black', stroke: props.color || 'black', height: '24px', width: '24px'}} >
      {props.children}
    </svg>
  }
}
