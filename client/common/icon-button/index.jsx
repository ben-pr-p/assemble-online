import { Component, h } from 'preact'

export default class IconButton extends Component {
  render ({children, style, ...props}) {
    return (
      <a {...props} style={{cursor: 'pointer', ...style}} >
        {children}
      </a>
    )
  }
}
