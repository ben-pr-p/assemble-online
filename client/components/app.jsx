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
const UPDATE_INTERVAL = 99

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: [],
      me: null,
      roomName: 'plaza',
      dimensions: null,
      editingUser: false,
      audioStreams: [],
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

    this.socket = io.connect()
    this.socket.on('connect', this.handleUsers.bind(this))
    this.socket.on('users', this.handleUsers.bind(this))
    this.socket.on('movement-update', this.handleMovement.bind(this))

    if (this.state.me) {
      this.announceMe()
    }
  }

  findMe () {
    this.state.me = store.get('me')
  }

  announceMe () {
    this.socket.emit('newuser', this.state.me, this.handleUsers.bind(this))
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

  announceLocation (user) {
    this.socket.emit('movement', user, this.handleMovement.bind(this))
  }

  handleMovement (data) {
    const me = data.users.filter(u => u.id == this.state.me.id)[0]
    this.setState({
      users: data.users,
      dimensions: data.dimensions,
      translate: this.calcTranslate({x: me.x, y: me.y})
    })
  }

  announceVolume (rms) {
    this.socket.emit('my-volume', {userId: this.state.me.id, rms: rms})
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
    if (!this.myBlob) this.setMeBlobRef()

    const posOfMe = this.myBlob.getBoundingClientRect()
    // need to subtract radius
    const dx = (this.mousePos.x - 50 - posOfMe.left) * MAC
    const dy = (this.mousePos.y - 50 - posOfMe.top) * MAC

    const me = this.state.users.filter(u => u.id == this.state.me.id)[0]
    if (!me.x) me.x = 0
    if (!me.y) me.y = 0
    const newX = constrain(me.x + dx, 0, this.state.dimensions.x)
    const newY = constrain(me.y + dy, 0, this.state.dimensions.y)
    me.x = newX
    me.y = newY

    this.announceLocation(me)
  }

  calcTranslate (location) {
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
    const {users, dimensions, roomName, editingUser, translate} = this.state
    const me = this.state.users.filter(u => u.id == this.state.me.id)[0]
    const myData = this.state.me

    const blobs = users.map((u, i) => {
      return (<UserBlob user={u} idx={i} key={i} me={me} translate={translate} />)
    })

    let newUserModal
    if (!myData || editingUser)
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={myData} />)

    let requiresMe = []
    if (myData) {
      requiresMe.push(( <AudioController key='audio-controller' users={users} me={me} setEasyRTCId={this.setEasyRTCId.bind(this)} announceVolume={this.announceVolume.bind(this)} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div id='main-app'>
          {requiresMe}
          <AppBarIconMenu 
            roomName={roomName}
            clearLocal={this.clearLocal.bind(this)}
            setEditUserState={this.setEditUserState.bind(this)} />
          <Announcement text='Welcome to Assemble Live!' />
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
