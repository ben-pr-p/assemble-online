import { Component, h } from 'preact'

export default class IconButton extends Component {
  render ({children, ...props}) {
    return (
      <a {...props} style={{cursor: 'pointer'}} >
        {children}
      </a>
    )
  }
}
