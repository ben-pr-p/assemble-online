import React from 'react'
import store from 'store'
import io from 'socket.io-client'
import Peer from 'peerjs'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import KeyManager from '../lib/key-manager'
import Grid from './grid/grid'
import AppBarIconMenu from './app-bar/app-bar'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'

const pixelsPerKey = 10

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: [],
      me: null,
      dimensions: null,
      editingUser: false,
      audioStreams: []
    }

    this.outgoingCalls = {}
    this.incomingCalls = {}
    this.mouseDown = false
  }

  componentWillMount () {
    this.findMe()

    this.socket = io()
    this.socket.on('connect', this.handleUsers.bind(this))
    this.socket.on('users', this.handleUsers.bind(this))
    this.socket.on('movement-update', this.handleMovement.bind(this))

    if (this.state.me) {
      this.announceMe()
      this.peer = new Peer(this.state.me.id, {key: 'k4r0b5lpfn1m7vi'})
    }
  }

  componentDidMount () {
    if (this.state.me) this.announceScreenSize()
  }

  findMe () {
    this.state.me = store.get('me')
  }

  announceMe () {
    if (this.refs.plaza) {
      this.state.me.screenSize = {
        x: this.refs.plaza.width.baseVal.value,
        y: this.refs.plaza.height.baseVal.value
      }
    }

    this.socket.emit('newuser', this.state.me, this.handleUsers.bind(this))
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

  announceScreenSize () {
    this.state.me.screenSize = {
      x: this.refs.plaza.clientWidth,
      y: this.refs.plaza.clientHeight
    }

    this.announceMe()
  }

  handleMovement (data) {
    this.setState({users: data.users, dimensions: data.dimensions})
  }

  closeNewUserModal () {
    this.findMe()
    this.announceMe()
    this.setEditUserState(false)
  }

  onMouseMove (ev) {
    if (this.mouseDown) {
      let newX = ev.nativeEvent.clientX
      let newY = ev.nativeEvent.clientY

      let me = this.state.users.filter(u => u.id == this.state.me.id)[0]
      me.x = newX
      me.y = newY
      this.announceLocation(me)
    }
  }

  setEditUserState (value) {
    this.setState({editingUser: value})
  }

  render () {
    const {users, me, dimensions, editingUser} = this.state

    const blobs = users.map((u, i) => {
      return (<UserBlob user={u} idx={i} key={i} />)
    })

    let newUserModal
    if (!me || editingUser)
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={me} />)

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <div id='main-app'>
          <AppBarIconMenu setEditUserState={this.setEditUserState.bind(this)} />
          <svg id='plaza' onMouseMove={this.onMouseMove.bind(this)} onMouseDown={() => this.mouseDown = true} onMouseUp={() => this.mouseDown = false} ref='plaza' >
            <g id='viewport' >
              <Grid dimensions={dimensions} />
              {blobs}
            </g>
          </svg>
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }
}
