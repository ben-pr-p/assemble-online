import React from 'react'
import store from 'store'
import io from 'socket.io-client'
import dom from 'component-dom'
import { Motion, spring } from 'react-motion'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import KeyManager from '../lib/key-manager'
import Grid from './grid/grid'
import AppBarIconMenu from './app-bar/app-bar'
import Announcement from './announcement/announcement'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio-controller'

// movement attenuation constant
const MAC = .05

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

    window.onresize = this.handleWindowResize.bind(this)
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
    this.updateIntervalId = window.setInterval(this.moveUser.bind(this), 10)
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
    const newX = constrain(me.x + dx, 0, this.state.dimensions.x)
    const newY = constrain(me.y + dy, 0, this.state.dimensions.y)
    me.x = newX
    me.y = newY

    this.announceLocation(me)
  }

  calcTranslate (location) {
    return {
      x: (-1) * location.x + (window.screen.width / 2),
      y: (-1) * location.y + (window.screen.height / 2)
    }
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

  handleWindowResize () {
    this.setState({
      screenDims: {x: window.screen.width, y: window.screen.height}
    })
  }

  render () {
    const {users, me, dimensions, roomName, editingUser, translate} = this.state

    const blobs = users.map((u, i) => {
      return (<UserBlob user={u} idx={i} key={i} />)
    })

    let newUserModal
    if (!me || editingUser)
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={me} />)

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' users={users} me={me} setEasyRTCId={this.setEasyRTCId.bind(this)} announceVolume={this.announceVolume.bind(this)} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
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
