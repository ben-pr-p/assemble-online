import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'

const pixelsPerSecond = 100
const updateFrequency = 100

function glide (source, target, fn) {
  let numMicroSeconds = (target - source) / pixelsPerSecond * 1000
  let current = target

  let totalIterations = numMicroSeconds / updateFrequency
  let iterationsTranspired = 0

  let intervalId = window.setInterval(function () {
    current += pixelsPerSecond / updateFrequency
    fn(current)

    if (++iterationsTranspired == totalIterations) {
      window.clearInterval(intervalId)
    }
  }, updateFrequency)
}

export default class UserBlob extends React.Component {
  constructor () {
    super()
    this.state = {
      x: null,
      y: null
    }
  }

  componentWillMount () {
    this.state.x = this.props.user.x
    this.state.y = this.props.user.y

    this.fill = d3.scale.category20(this.props.idx)
  }

  componentWillReceiveProps (nextProps) {
    let currentX, currentY
    if (this.refs.circle) {
      currentX = this.refs.circle.cx.baseVal.value
      currentY = this.refs.circle.cx.baseVal.value
    }

    glide(currentX, nextProps.user.x, x => this.setState({x: x}))
    glide(currentY, nextProps.user.y, y => this.setState({y: y}))
  }

  render () {
    const { user, idx } = this.props
    const { x, y } = this.state

    return (
      <g className='user-blob' id={user.id}>
        <circle cx={x} cy={y} r='50' fill={this.fill} ref='circle' />
      </g>
    )
  }
}
