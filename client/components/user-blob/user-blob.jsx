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

    this.t = {
      x: null,
      y: null,
      t: null
    }

    this.selectedCircle = null
  }

  componentWillMount () {
    this.state.x = this.props.user.x
    this.state.y = this.props.user.y

    this.fill = d3.scale.category20()(this.props.idx)
  }

  componentDidMount () {
    this.selectedCircle = d3.select(this.refs.circle)
  }

  componentWillReceiveProps (nextProps) {
    const next = {x: nextProps.user.x, y: nextProps.user.y}
    const prev = {x: this.state.x, y: this.state.y}

    this.selectedCircle.transition()
     .attrTween('transform', (d, i, a) => {

       var movement = {
         x: next.x - prev.x,
         y: next.y - prev.y
       }

       return (t) => {
         this.t.x = prev.x + movement.x * t
         this.t.y = prev.y + movement.y * t
         this.t.t = t
         return `translate(${this.t.x}, ${this.t.y})`
       }
     })
     .each('end', () => {
       this.setState({x: next.x, y: next.y})
     })
  }

  render () {
    const { user, idx } = this.props
    const { x, y } = this.state

    return (
      <g className='user-blob' id={user.id}>
        <circle transform={`translate(${x},${y})`} r='50' fill={this.fill} ref='circle' />
      </g>
    )
  }
}
