import React, { Component } from 'react'

/*
 * TODO
 * Try inactive is not empty
 * Dots instead of grid
 * On size change you animate the growth
 * Try corners
 */

export default class Grid extends Component {
  render() {
    const { dimensions } = this.props

    const [x, y] = dimensions
    const width = dimensions && x ? x : '100%'
    const height = dimensions && y ? y : '100%'

    return (
      <svg className="grid" {...{ id: 'grid-container', width, height }}>
        <defs>
          <pattern
            id="smallGrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
          </pattern>
          <pattern
            id="grid"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <rect width="200" height="200" fill="url(#smallGrid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" strokeWidth="4" />
          </pattern>
        </defs>
        <rect {...{ id: 'grid-main', width, height, fill: 'url(#grid)' }} />
      </svg>
    )
  }
}
