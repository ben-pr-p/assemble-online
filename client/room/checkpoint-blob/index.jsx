import React, { Component } from 'react'
import { Checkpoint, Close } from '../../common/icons'
import IconButton from '../../common/icon-button'
import Sock from '../../lib/sock'

const r = 50
const d = r * 2

const sr = 25
const sd = sr * 2

export default class CheckpointBlob extends Component {
  state = {
    loc: []
  }

  componentWillMount () {
    this.state.loc = this.props.checkpoint.loc
  }

  move = ev => this.setState({
    loc: [this.state.loc[0] + ev.movementX, this.state.loc[1] + ev.movementY]
  })

  startTracking = () => {
    document.addEventListener('mousemove', this.move)
    setTimeout(() => document.addEventListener('mouseup', this.stopTracking), 1)
  }

  stopTracking = () => {
    document.removeEventListener('mousemove', this.move)
    Sock.emit('checkpoint-move', Object.assign({id: this.props.checkpoint.id}, {loc: this.state.loc}))
  }

  delete = () => Sock.emit('checkpoint-destroy', this.props.checkpoint)

  render () {
		const {checkpoint, translate} = this.props
		const {loc} = this.state

    const { id, members, color, name } = checkpoint

    let [ x, y ] = loc
    if (!x || isNaN(x)) x = 0
    if (!x || isNaN(y)) y = 0

    const adj = loc.map((num, idx) => num + translate[idx])

    const isFar = this.isFar({adj, x, y, translate})
    const specificD = (isFar ? sd: d)

    const blobStyle = {
      border: `5px solid ${color}`
    }

    Object.assign(blobStyle, this.computeWidthHeight(isFar))
    Object.assign(blobStyle, this.computeTransform(isFar, {x, y, translate}))

    return (
      <div className='checkpoint-blob' id={id}
        style={blobStyle}
        onMouseDown={this.startTracking}
        onMouseUp={this.stopTracking}
      >
        <div className='checkpoint-icon'>
          <Checkpoint color={color} />
        </div>
        <div className='checkpoint-label' style={{color}} >
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
