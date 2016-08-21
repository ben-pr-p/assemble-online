import React from 'react'
import store from 'store'
import dom from 'component-dom'
import uaparse from 'user-agent-parser'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Dialog from 'material-ui/Dialog'
import AppBar from './app-bar/app-bar'
import Announcement from './announcement/announcement'
import NewUserModal from './new-user-modal/new-user-modal'
import AudioController from './audio/controller'
import Room from './room/room'
import customTheme from '../lib/custom-theme.js'
import Boss from '../lib/boss'

/**
 * TO DO
  * see who posted announcements
  * doodle / scheduling system
  * kick out / mute for facillitator
  * mode where only facillitator can make announcements
  * location reference for squares
  * Arrow key movement
  * Extended user profiles
    * view other users
  * Create tests for performance
  * Serve locations directly to user blobs
  * Persist locations across refreshes
  * Sandstorm.io
  * Agenda setting widget
  * Barriers
  * Documents
  * MS Paint
  * Full accessibility - voice, keys, and mouse exclusive navigation
  * WebRTC to PSTN signaling
  * Disappearing trails
 */

/**
 * DESIGN SUGGESTIONS
  * transparent user overlaps
  * on feedback - try black box around icon and black headers
  * use greed red spectrum for agree disagree
 */

/**
 * FEATURE SUGGESTIONS
  * searchable public rooms sorted by number of active users
    * if same number then alphabetized
  * chat
  * mute yourself option
  * take a picture with camera
  * click on heads and go to the person
  * optional video communication
  * badges for agreements
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
      editingUser: false,
    }

    const boundMethods = 'setEditUserState setEasyRTCId closeNewUserModal clearLocal'
    boundMethods.split(' ').forEach(m => {
      this[m] = this[m].bind(this)
    })
  }

  componentWillMount () {
    this.state.browser.name = uaparse(navigator.userAgent).browser.name
    if (goodBrowsers.indexOf(this.state.browser.name) < 0)
      return this.state.browser.bad = true

    this.state.me = store.get('me')
    Boss.on('users', this.handleUsers.bind(this), 'App')
    if (this.state.me)
      this.announceMe()

    this.state.roomName = dom('#reactAppContainer').attr('data')
    if (this.state.roomName)
      Boss.post('room-name', this.state.roomName)
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
    const {me, users, editingUser, browser, roomName} = this.state
    if (browser.bad)
      return this.renderBadBrowser()

    let newUserModal
    if (!me || editingUser) {
      newUserModal = (<NewUserModal closeNewUserModal={this.closeNewUserModal} me={me} />)
    }

    let requiresMe = []
    if (me) {
      requiresMe.push(( <AudioController key='audio-controller' me={me} roomName={roomName} setEasyRTCId={this.setEasyRTCId} /> ))
      requiresMe.push(( <Room key='room' me={me} users={users} /> ))
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(customTheme)}>
        <div id='main-app'>
          {requiresMe}
          <AppBar key='app-bar'
            clearLocal={this.clearLocal}
            setEditUserState={this.setEditUserState} />
          <Announcement roomName={roomName} />
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
