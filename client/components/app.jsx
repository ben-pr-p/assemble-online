import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'
import store from 'store'
import KeyManager from '../lib/key-manager'
import io from 'socket.io-client'
import AppBarIconMenu from './app-bar/app-bar'
import Grid from './grid/grid'

const pixelsPerKey = 10

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: [],
      me: null,
      dimensions: null,
      editingUser: false
    }

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

  onMouseDown () {
    this.mouseDown = true
  }

  onMouseUp () {
    this.mouseDown = false
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
      <MuiThemeProvider>
        <div id='main-app'>
          <AppBarIconMenu setEditUserState={this.setEditUserState.bind(this)} />
          <svg id='plaza' onMouseMove={this.onMouseMove.bind(this)} onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMouseUp.bind(this)} ref='plaza' >
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
