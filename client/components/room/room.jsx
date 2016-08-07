import React from 'react'
import {Motion, spring} from 'react-motion'
import Grid from '../grid/grid'
import UserBlob from '../user-blob/user-blob'

// movement attenuation constant
const MAC = .05
const UPDATE_INTERVAL = 50

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      locations: {},
      dimensions: {},
      volumes: {},
      translate: {x: 0, y: 0}
    }

    this.mousePos = {}
    this.updateIntervalId = null
    this.myBlob = null
  }

  componentWillMount () {
    this.props.socket.on('locations', this.handleLocations.bind(this))
    this.props.socket.on('volumes', this.handleVolumes.bind(this))
    this.props.socket.on('dimensions', this.handleDimensions.bind(this))
  }

  setMeBlobRef () {
    const query = '#' + this.props.me.id
    this.myBlob = document.querySelector(query)
    console.log(this.myBlob)
  }

  handleVolumes (data) {
    this.setState({
      volumes: data
    })
  }

  handleDimensions (data) {
    this.setState({
      dimensions: data
    })
  }

  handleLocations (data) {
    this.setState({
      locations: data,
      translate: this.calcTranslate(data[this.props.me.id])
    })
  }

  onMouseDown () {
    this.moveUser()
    this.updateIntervalId = window.setInterval(this.moveUser.bind(this), UPDATE_INTERVAL)
  }

  onMouseUp () {
    window.clearInterval(this.updateIntervalId)
    this.updateIntervalId = null
  }

  onMouseMove (ev) {
    this.mousePos = {
      x: ev.nativeEvent.clientX,
      y: ev.nativeEvent.clientY
    }
  }

  moveUser () {
    const {locations, users, dimensions} = this.state
    const {me} = this.props
    if (!this.myBlob) this.setMeBlobRef()

    const posOfMe = this.myBlob.getBoundingClientRect()

    // need to subtract radius
    const dx = (this.mousePos.x - 50 - posOfMe.left) * MAC
    const dy = (this.mousePos.y - 50 - posOfMe.top) * MAC

    const base = locations[me.id]
    if (!base.x) base.x = 0
    if (!base.y) base.y = 0
    const x = constrain(base.x + dx, 0, dimensions.x)
    const y = constrain(base.y + dy, 0, dimensions.y)

    this.props.socket.emit('my-location', {x, y})
  }

  calcTranslate (location) {
    if (!location) return {x: 0, y: 0}

    let x = (-1) * location.x + (window.innerWidth / 2) - 25
    let y = (-1) * location.y + (window.innerHeight / 2) - 25

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    return {x, y}
  }

  render () {
    const {me, users} = this.props
    const {volumes, locations, translate, dimensions} = this.state

    const blobs = []
    let idx = 0
    for (let u in users) {
      blobs.push((
        <UserBlob user={users[u]}
          location={locations[u] || {x: 0, y: 0}}
          volume={volumes[u] || 0}
          idx={idx}
          key={u}
          me={locations[me.id]}
          translate={translate}
          isMe={u == me.id}
        />
      ))
      idx++
    }

    return (
      <svg id='plaza' onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)} >
        <Motion
          defaultStyle={{x: translate.x, y: translate.y}}
          style={{x: spring(translate.x), y: spring(translate.y)}}
        >
          {trans => 
            <g id='viewport' transform={`translate(${trans.x}, ${trans.y})`} >
              <Grid dimensions={dimensions} />
              {blobs}
            </g>
          }
        </Motion>
      </svg>
    )
  }
}

function constrain (x, min, max) {
  return Math.min(Math.max(x, min), max)
}
