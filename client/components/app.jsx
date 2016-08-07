import React from 'react'
import store from 'store'
import io from 'socket.io-client'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import AppBarIconMenu from './app-bar/app-bar'
import Announcement from './announcement/announcement'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio-controller'
import Room from './room/room'
import customTheme from '../lib/custom-theme.js'

// TO DO: SOCKET UPDATES SHOULD BE DONE USING SERVICE WORKERS AND USER'S
// MOVEMENT SHOULD BE PERFECT

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: {},
      me: null,
      roomName: 'plaza',
      editingUser: false,
    }
  }

  componentWillMount () {
    this.state.me = store.get('me')

    this.socket = io()
    this.socket.on('connect', this.handleUsers.bind(this))
    this.socket.on('users', this.handleUsers.bind(this))

    if (this.state.me) {
      this.announceMe()
    }
  }

  announceMe () {
    this.socket.emit('me', this.state.me)
  }

  handleUsers (users) {
    if (users) {
      this.setState({
        users: users
      })
    }
  }

  closeNewUserModal () {
    this.state.me = store.get('me')
    this.announceMe()
    this.setEditUserState(false)
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
    const {me, users, editingUser} = this.state
    let newUserModal
    if (!me || editingUser) {
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={me} />)
    }

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' users={users} me={me} setEasyRTCId={this.setEasyRTCId.bind(this)} socket={this.socket} /> ))
      requiresMe.push(( <Room me={me} users={users} socket={this.socket} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div id='main-app'>
          {requiresMe}
          <AppBarIconMenu 
            clearLocal={this.clearLocal.bind(this)}
            setEditUserState={this.setEditUserState.bind(this)} />
          <Announcement socket={this.socket} />
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }
}
