import React from 'react'
import {plaza} from '../../lib/custom-theme'

export default class Grid extends React.Component {
  constructor () {
    super()
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.dimensions.x != nextProps.dimensions.x || this.props.dimensions.y != nextProps.dimensions.y)
      return true
    return false
  }

  render () {
    const {dimensions} = this.props

    let w = dimensions ? dimensions.x : '100%'
    let h = dimensions ? dimensions.y : '100%'

    return (
      <g id='grid-container' width={w} height={h} >
        <defs>
          <pattern id='smallGrid' width='40' height='40' patternUnits='userSpaceOnUse'>
            <path d='M 40 0 L 0 0 0 40' fill='none' stroke={plaza.palette.textColor} strokeWidth='1'/>
          </pattern>
          <pattern id='grid' width='200' height='200' patternUnits='userSpaceOnUse'>
            <rect width='200' height='200' fill='url(#smallGrid)'/>
            <path d='M 200 0 L 0 0 0 200' fill='none' stroke={plaza.palette.textColor} strokeWidth='4'/>
          </pattern>
        </defs>

        <rect id='grid-main' width={w} height={h} fill='url(#grid)' />
      </g>
    )
  }
}
