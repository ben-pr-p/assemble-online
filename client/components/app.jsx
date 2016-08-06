import React from 'react'
import store from 'store'
import io from 'socket.io-client'
import dom from 'component-dom'
import { Motion, spring } from 'react-motion'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import KeyManager from '../lib/key-manager'
import Grid from './grid/grid'
import AppBarIconMenu from './app-bar/app-bar'
import Announcement from './announcement/announcement'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio-controller'
import customTheme from '../lib/custom-theme.js'

// TO DO: SOCKET UPDATES SHOULD BE DONE USING SERVICE WORKERS AND USER'S
// MOVEMENT SHOULD BE PERFECT

// movement attenuation constant
const MAC = .05
const UPDATE_INTERVAL = 50

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: {},
      locations: {},
      dimensions: {},
      volumes: {},
      me: null,
      roomName: 'plaza',
      editingUser: false,
      translate: {x: 0, y: 0}
    }

    this.outgoingCalls = {}
    this.incomingCalls = {}
    this.updateIntervalId = null
    this.mousePos = {}
    this.myBlob = null
  }

  componentWillMount () {
    this.findMe()

    this.socket = io()
    this.socket.on('connect', this.handleUsers.bind(this))
    this.socket.on('users', this.handleUsers.bind(this))
    this.socket.on('locations', this.handleLocations.bind(this))
    this.socket.on('dimensions', this.handleDimensions.bind(this))
    this.socket.on('distances', this.handleDistances.bind(this))
    this.socket.on('volumes', this.handleVolumes.bind(this))

    if (this.state.me) {
      this.announceMe()
    }
  }

  findMe () {
    this.state.me = store.get('me')
  }

  announceMe () {
    this.socket.emit('me', this.state.me, this.handleUsers.bind(this))
  }

  announceVolume (rms) {
    this.socket.emit('my-volume', rms)
  }

  setMeBlobRef () {
    const query = '#' + this.state.me.id
    this.myBlob = document.querySelector(query)
  }

  handleUsers (users) {
    if (users) {
      this.setState({
        users: users
      })
    }
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
    const { me } = this.state
    this.setState({
      locations: data,
      translate: this.calcTranslate(data[me.id])
    })
  }

  handleDistances (data) {
    this.setState({
      distances: data
    })
  }

  closeNewUserModal () {
    this.findMe()
    this.announceMe()
    this.setEditUserState(false)
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
    const {me, locations, users, dimensions} = this.state
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

    this.socket.emit('my-location', {x, y})
  }

  calcTranslate (location) {
    if (!location) return {x: 0, y: 0}

    let x = (-1) * location.x + (window.innerWidth / 2) - 25
    let y = (-1) * location.y + (window.innerHeight / 2) - 25

    if (isNaN(x)) x = 0
    if (isNaN(y)) y = 0

    return {x, y}
  }

  setEasyRTCId (easyrtcid) {
    this.state.me.easyrtcid = easyrtcid
    this.announceMe()
  }

  setEditUserState (value) {
    this.setState({editingUser: value})
  }

  clearLocal () {
    store.clear()
    this.state.me = null
    this.forceUpdate()
  }

  render () {
    const {me, users, locations, volumes, dimensions, editingUser, translate} = this.state

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

    let newUserModal
    if (!me || editingUser) {
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={me} />)
    }

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' users={users} me={me} setEasyRTCId={this.setEasyRTCId.bind(this)} socket={this.socket} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div id='main-app'>
          {requiresMe}
          <AppBarIconMenu 
            clearLocal={this.clearLocal.bind(this)}
            setEditUserState={this.setEditUserState.bind(this)} />
          <Announcement socket={this.socket} />
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
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }
}

function constrain (x, min, max) {
  return Math.min(Math.max(x, min), max)
}
