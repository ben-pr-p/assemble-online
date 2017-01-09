import { Component, h } from 'preact'
import store from 'store'
import Menu from './menu'
import Room from './room'
import ThemeManager from '../lib/theme-manager'
import Boss from '../lib/boss'
import { Bus } from '../lib/emitters'

export default class Main extends Component {
  state = {
    users: new Map(),
    me: null
  }

  componentWillMount () {
    this.state.roomName = document.querySelector('#reactAppContainer').getAttribute('data')

    Boss.on('users', this.handleUsers, 'App')
    Bus.on('me', this.handleMe)

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

  announceMe = data => Boss.post('user/new', data)

  handleMe = me => this.setState({ me })

  clearLocal = () => {
    store.clear()
    this.state.me = null
    Boss.post('user/trash')
    this.forceUpdate()
  }


  render (props, { me, users, roomName, theme }) {
    const {
      setEditUserState,
      setEasyRTCId,
      clearLocal
    } = this

    return (
      <div id='main-app'>
        {me && <Room {...{me, users}} />}
        <Menu {...{me, clearLocal}} />
      </div>
    )
  }
}
