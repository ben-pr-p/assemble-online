import { Component, h } from 'preact'
import store from 'store'
import dom from 'component-dom'
import Menu from './menu'
import Agenda from './agenda/agenda'
import AudioController from './audio/controller'
import Room from './room/room'
import Colors from './colors/colors'
import ThemeManager from '../lib/theme-manager'
import Boss from '../lib/boss'

const goodBrowsers = ['Chrome', 'Chromium', 'Firefox', 'Mozilla', 'Opera', 'Bowser', 'Canary']

export default class Main extends Component {
  state = {
    users: new Map(),
    me: null
  }

  componentWillMount () {
    this.state.roomName = dom('#reactAppContainer').attr('data')

    Boss.on('users', this.handleUsers, 'App')

    if (this.state.roomName)
      Boss.post('room-name', this.state.roomName)

    this.state.me = store.get('me')
    if (this.state.me) this.announceMe(this.state.me)
  }

  componentWillUnmount () {
    Boss.offAllByCaller('App')
  }

  handleUsers = users => users
    ? this.setState({ users: new Map(users) })
    : null

  setEasyRTCId = (easyrtcid) => {
    this.state.me.easyrtcid = easyrtcid
    this.announceMe(this.state.me)
  }

  clearLocal = () => {
    store.clear()
    this.state.me = null
    Boss.post('user/trash')
    this.forceUpdate()
  }

  announceMe (data) {
    Boss.post('user/new', data)
  }

  render (props, { me, users, roomName, theme }) {
    const {
      setEditUserState,
      setEasyRTCId,
      clearLocal
    } = this

    return (
      <div id='main-app'>
        {me
          ? <AudioController {...{me, roomName, setEasyRTCId}} />
          : null
        }
        <Room {...{me, users}} />
        <Menu {...{me, clearLocal}} />
        <Agenda {...{roomName}} />
      </div>
    )
  }
}
