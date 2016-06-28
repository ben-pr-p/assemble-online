import React from 'react'

export default class Grid extends React.Component {
  constructor () {
    super()
  }

  render () {
    const {dimensions} = this.props

    let w = dimensions ? dimensions.x : '100%'
    let h = dimensions ? dimensions.y : '100%'

    return (
      <g id='grid-container' width={w} height={h} >
        <defs>
          <pattern id='smallGrid' width='20' height='20' patternUnits='userSpaceOnUse'>
            <path d='M 20 0 L 0 0 0 20' fill='none' stroke='gray' stroke-width='0.5'/>
          </pattern>
          <pattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'>
            <rect width='100' height='100' fill='url(#smallGrid)'/>
            <path d='M 100 0 L 0 0 0 100' fill='none' stroke='gray' stroke-width='1'/>
          </pattern>
        </defs>

        <rect id='grid' width={w} height={h} fill='url(#grid)' />
      </g>
    )
  }
}
