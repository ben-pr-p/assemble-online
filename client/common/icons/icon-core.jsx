import { h, Component } from 'preact'

export default class IconCore extends Component {
  wrapper = (props, children) => {
    <svg style={{fill: props.color || 'black', stroke: props.color || 'black'}} >
      {children}
    </svg>
  }
}
