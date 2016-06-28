import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'
import store from 'store'
import KeyManager from '../lib/key-manager'
import io from 'socket.io-client'
import AppBarIconMenu from './app-bar/app-bar'

const pixelsPerKey = 10

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: [],
      me: null
    }

    this.mouseDown = false
  }

  componentWillMount () {
    this.findMe()

    this.socket = io()
    this.socket.on('connect', this.handleUsers.bind(this))
    this.socket.on('users', this.handleUsers.bind(this))

    if (this.state.me) {
      this.announceMe()
    }
  }

  handleUsers (users) {
    if (users) {
      this.setState({
        users: users
      })
    }
  }

  findMe () {
    this.state.me = store.get('me')
  }

  announceMe () {
    this.socket.emit('newuser', this.state.me, this.handleUsers.bind(this))
  }

  announceLocation (user) {
    this.socket.emit('movement', user, this.handleUsers.bind(this))
  }

  closeNewUserModal () {
    this.findMe()
    this.announceMe()
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

  render () {
    let {users, me} = this.state

    let blobs = users.map((u, i) => {
      return (<UserBlob user={u} idx={i} key={i} />)
    })

    let newUserModal
    if (!me)
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} />)

    return (
      <MuiThemeProvider>
        <div id='main-app'>
          <AppBarIconMenu />
          <svg id='plaza' onMouseMove={this.onMouseMove.bind(this)} onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMouseUp.bind(this)} >
            {blobs}
          </svg>
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }
}
