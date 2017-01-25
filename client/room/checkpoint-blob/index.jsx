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
  render ({checkpoint}) {
    const { location, translate, color, name } = checkpoint

    let [ x, y ] = location
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = {
      x: x + translate.x,
      y: y + translate.y
    }

    const isFar = this.isFar({adj, isMe, x, y, translate})
    const specificD = (isFar ? sd: d)

    return (
      <div className='checkpoint-blob' id={user.id}
        style={Object.assign(
          this.computeWidthHeight(isFar),
          this.computeTransform(isFar, {x, y, translate})
        )}
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

  isFar = ({adj, isMe, x, y, translate}) =>
    (!(isMe) && (adj.x < 0 || adj.x > window.innerWidth || adj.y < 0 || adj.y > window.innerHeight))

  computeWidthHeight = (isFar) => !isFar
    ? {width: `${d}px`, height: `${d}px`}
    : {width: `${sd}px`, height: `${sd}px`}

  computeTransform = (isFar, {x, y, translate}) => true //!isFar
    ? {transform: `translate3d(${x}px,${y}px, 0px)`}
    : this.computeFarTransform({x, y, translate})
}
