import React from 'react'
import store from 'store'
import uaparse from 'user-agent-parser'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import AppBar from './app-bar/app-bar'
import Announcement from './announcement/announcement'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio-controller'
import Room from './room/room'
import customTheme from '../lib/custom-theme.js'
import Boss from '../lib/boss'

/**
 * TO DO
  * Arrows on the user blobs
  * Serve locations directly to user blobs
  * Persist locations across refreshes
  * Sub url spawning
  * What's happening on first user register? Sequencing problem most likely
  * Create tests for performance
  * Extended user profiles
  * Arrow key movement
  * Agenda setting widget
  * Full accessibility - voice, keys, and mouse exclusive navigation
  * WebRTC to PSTN signaling
 */

const goodBrowsers = ['Chrome', 'Chromium', 'Firefox', 'Mozilla', 'Opera', 'Bowser', 'Canary']

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      browser: {
        name: null,
        bad: false
      },
      users: new Map(),
      me: null,
      roomName: 'plaza',
      editingUser: false,
    }
  }

  componentWillMount () {
    this.state.browser.name = uaparse(navigator.userAgent).browser.name
    if (goodBrowsers.indexOf(this.state.browser.name) < 0)
      this.state.browser.bad = true

    this.state.me = store.get('me')

    Boss.on('users', this.handleUsers.bind(this), 'App')

    if (this.state.me) {
      this.announceMe()
    }
  }

  announceMe () {
    Boss.post('me', this.state.me)
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
    Boss.post('trash-me')
    this.forceUpdate()
  }

  render () {
    const {me, users, editingUser, browser} = this.state
    if (browser.bad) 
      return this.renderBadBrowser()

    let newUserModal
    if (!me || editingUser) {
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal.bind(this)} me={me} />)
    }

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' me={me} setEasyRTCId={this.setEasyRTCId.bind(this)} /> ))
      requiresMe.push(( <Room key='room' me={me} users={users} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div id='main-app'>
          {requiresMe}
          <AppBar
            clearLocal={this.clearLocal.bind(this)}
            setEditUserState={this.setEditUserState.bind(this)} />
          <Announcement />
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }

  renderBadBrowser () {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
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
