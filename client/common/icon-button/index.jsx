import React, { Component } from 'react'

export default class IconButton extends Component {
  render() {
    const { children, style, className, ...props } = this.props

    return (
      <a
        {...props}
        className={className}
        style={{ cursor: 'pointer', ...style }}
      >
        {children}
      </a>
    )
  }
}
