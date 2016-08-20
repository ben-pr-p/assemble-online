import React from 'react'
import {Motion, spring} from 'react-motion'
import Grid from '../grid/grid'
import UserBlob from '../user-blob/user-blob'
import Boss from '../../lib/boss'

// movement attenuation constant
const MAC = .1
const UPDATE_INTERVAL = 30
const STIFFNESS = 50
const DAMPING = 60

function mapValuesSum (map) {
  return Array.from(map.values()).reduce((a, b) => a + b)
}

export default class Room extends React.Component {
  constructor () {
    super()
    this.state = {
      locations: new Map(),
      volumes: new Map(),
      dimensions: {},
      translate: {x: 0, y: 0}
    }

    this.mousePos = {}
    this.updateIntervalId = null
    this.myBlob = null

    window.onresize = this.postScreen.bind(this)
  }

  componentWillMount () {
    Boss.on('dimensions', this.handleDimensions.bind(this), 'Room')
    Boss.on('translate', this.handleTranslate.bind(this), 'Room')

    this.postScreen()
  }

  postScreen () {
    Boss.post('screen', {x: window.innerWidth, y: window.innerHeight})
  }

  componentWillUnmount () {
    Boss.offAllByCaller('Room')
  }

  setMeBlobRef () {
    const query = '#' + this.props.me.id
    this.myBlob = document.querySelector(query)
  }

  handleDimensions (data) {
    this.setState({
      dimensions: data
    })
  }

  handleTranslate (data) {
    this.setState({
      translate: data
    })
  }

  onMouseDown () {
    this.moveUser()
    if (!this.updateIntervalId)
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
    const {locations, dimensions} = this.state
    const {me} = this.props
    if (!this.myBlob) this.setMeBlobRef()

    const posOfMe = this.myBlob.getBoundingClientRect()

    // need to subtract radius
    const dx = (this.mousePos.x - 50 - posOfMe.left) * MAC
    const dy = (this.mousePos.y - 50 - posOfMe.top) * MAC
    Boss.post('my-delta', {dx, dy})
  }

  render () {
    const {me, users} = this.props
    const {volumes, locations, translate, dimensions} = this.state

    const blobs = []
    let idx = 0
    users.forEach((user, uid) => {
      blobs.push((
        <UserBlob user={user}
          volume={volumes.has(uid) ? volumes.get(uid) : 0 }
          idx={idx} key={uid}
          me={locations.get(me.id)}
          translate={translate}
          isMe={uid == me.id}
        />
      ))
      idx++
    })

    const springParams = {stiffness: STIFFNESS, damping: DAMPING}

    return (
      <svg id='plaza' onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMouseUp.bind(this)} onMouseMove={this.onMouseMove.bind(this)} >
        <Motion
          defaultStyle={{x: translate.x, y: translate.y}}
          style={{x: spring(translate.x, springParams), y: spring(translate.y, springParams)}}
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

