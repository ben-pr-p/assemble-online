import { Component, h } from 'preact'
import theme from '../../lib/theme-manager'

export default class Grid extends Component {
  shouldComponentUpdate (nextProps) {
    return (this.props.dimensions.x != nextProps.dimensions.x || this.props.dimensions.y != nextProps.dimensions.y)
  }

  render ({dimensions}) {
    const width = dimensions && dimensions.x ? dimensions.x : '100%'
    const height = dimensions && dimensions.y ? dimensions.y : '100%'

    return (
      <svg className='grid' {...{id: 'grid-container', width, height}} >
        <defs>
          <pattern id='smallGrid' width='40' height='40' patternUnits='userSpaceOnUse'>
            <path d='M 40 0 L 0 0 0 40' fill='none' stroke-width='1'/>
          </pattern>
          <pattern id='grid' width='200' height='200' patternUnits='userSpaceOnUse'>
            <rect width='200' height='200' fill='url(#smallGrid)' />
            <path d='M 200 0 L 0 0 0 200' fill='none' stroke-width='4'/>
          </pattern>
        </defs>
        <rect {...{id: 'grid-background', width, height}} />
        <rect {...{id: 'grid-main', width, height, fill: 'url(#grid)'}}/>
      </svg>
    )
  }
}
