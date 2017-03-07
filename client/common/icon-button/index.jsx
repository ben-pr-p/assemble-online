import { Component, h } from 'preact'

export default class IconButton extends Component {
  render ({children, style, className, ...props}) {
    return (
      <a {...props} className={className} style={{cursor: 'pointer', ...style}} >
        {children}
      </a>
    )
  }
}
