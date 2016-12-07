import { Component, h } from 'preact'
import store from 'store'
import dom from 'component-dom'
import Menu from './menu'
import Room from './room'
import ThemeManager from '../lib/theme-manager'
import Boss from '../lib/boss'

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
        <Room {...{me, users}} />
        <Menu {...{me, clearLocal}} />
      </div>
    )
  }
}
