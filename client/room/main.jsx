import React from 'react'
import store from 'store'
import dom from 'component-dom'
import uaparse from 'user-agent-parser'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import AppBar from './app-bar/app-bar'
import Agenda from './agenda/agenda'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio/controller'
import Room from './room/room'
import Colors from './colors/colors'
import {solarizedDark, solarizedLight} from '../lib/custom-theme.js'
import Boss from '../lib/boss'

const goodBrowsers = ['Chrome', 'Chromium', 'Firefox', 'Mozilla', 'Opera', 'Bowser', 'Canary']

export default class Main extends React.Component {
  constructor () {
    super()
    this.state = {
      browser: {
        name: null,
        bad: false
      },
      users: new Map(),
      me: null,
      editingUser: false,
      editingColor: false,
      theme: JSON.parse(JSON.stringify(solarizedDark))
    }

    const boundMethods = 'setEditUserState setEasyRTCId closeNewUserModal clearLocal handleUsers openColorModal setColors closeColorModal'
    boundMethods.split(' ').forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  componentWillMount () {
    this.state.browser.name = uaparse(navigator.userAgent).browser.name
    if (goodBrowsers.indexOf(this.state.browser.name) < 0)
      return this.state.browser.bad = true

    this.state.me = store.get('me')
    Boss.on('users', this.handleUsers, 'App')

    this.state.roomName = dom('#reactAppContainer').attr('data')
    if (this.state.roomName)
      Boss.post('room-name', this.state.roomName)

    if (this.state.me)
      this.announceMe()
  }

  announceMe () {
    Boss.post('user/new', this.state.me)
  }

  handleUsers (users) {
    if (users) {
      this.setState({
        users: new Map(users)
      })
    }
  }

  closeNewUserModal () {
    this.state.me = store.get('me')
    this.announceMe()
    this.setEditUserState(false)
  }

  openColorModal () {
    this.setState({
      editingColor: true
    })
  }

  closeColorModal () {
    this.setState({
      editingColor: false
    })
  }

  setEasyRTCId (easyrtcid) {
    this.state.me.easyrtcid = easyrtcid
    this.announceMe()
  }

  setEditUserState (value) {
    this.setState({editingUser: value})
  }

  setColors (theme) {
    this.setState({
      theme: JSON.parse(JSON.stringify(theme))
    })
  }

  clearLocal () {
    store.clear()
    this.state.me = null
    Boss.post('user/trash')
    this.forceUpdate()
  }

  render () {
    const {me, users, editingColor, editingUser, browser, roomName, theme} = this.state
    if (browser.bad)
      return this.renderBadBrowser()

    let newUserModal
    if (!me || editingUser) {
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal} me={me} />)
    }

    let colorModal
    if (editingColor) {
      colorModal = (<Colors setColors={this.setColors} palette={theme.palette} closeColorModal={this.closeColorModal} />)
    }

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' me={me} roomName={roomName} setEasyRTCId={this.setEasyRTCId} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <div id='main-app'>
          {requiresMe}
          <Room key='room' me={me} users={users} />
          <AppBar key='app-bar'
            clearLocal={this.clearLocal}
            openColorModal={this.openColorModal}
            setEditUserState={this.setEditUserState} />
          <Agenda roomName={roomName} />
          {newUserModal}
          {colorModal}
        </div>
      </MuiThemeProvider>
    )
  }

  renderBadBrowser () {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(menus)}>
        <Dialog open={true} >
          {`assemble.live uses WebRTC technology for its audio transfer and SharedWorkers for performance, which has only been implemented in Firefox, Chrome, and Opera.`}
          <br />
          <br />
          {`Please use one of those, instead of ${this.state.browser.name}.`}
        </Dialog>
      </MuiThemeProvider>
    )
  }
}

