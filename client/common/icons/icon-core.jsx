import React, { Component } from 'react'
import joinClass from '../join-class'
import shallowCompare from 'shallow-compare'

export default class IconCore extends Component {
  state = {}

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { children, className, color, style } = this.props

    return (
      <svg
        className={joinClass(className, 'icon-core')}
        style={{ fill: color, ...style }}
      >
        {children}
      </svg>
    )
  }
}
