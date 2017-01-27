import { Component, h } from 'preact'
import { Checkpoint } from '../../common/icons'

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

/*
 * TODO
 */

export default class CheckpointBlob extends Component {
  render ({checkpoint, translate}) {
    const { id, loc, members, color, name } = checkpoint

    let [ x, y ] = loc
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = loc.map((num, idx) => num + translate[idx])

    const isFar = this.isFar({adj, x, y, translate})
    const specificD = (isFar ? sd: d)

    const blobStyle = {
      border: `2px solid ${color}`
    }

    Object.assign(blobStyle, this.computeWidthHeight(isFar))
    Object.assign(blobStyle, this.computeTransform(isFar, {x, y, translate}))

    console.log(blobStyle)

    return (
      <div className='checkpoint-blob' id={id}
        style={blobStyle}
      >
        <div className='checkpoint-icon'>
          <Checkpoint color={color} />
        </div>
        <div className='checkpoint-label'>
          {name}
        </div>
      </div>
    )
  }

  isFar = ({adj, x, y, translate}) =>
    (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight)

  computeWidthHeight = (isFar) => !isFar
    ? {width: `${d}px`, height: `${d}px`}
    : {width: `${sd}px`, height: `${sd}px`}

  computeTransform = (isFar, {x, y, translate}) => true //!isFar
    ? {transform: `translate(${x}px,${y}px)`}
    : this.computeFarTransform({x, y, translate})
}
