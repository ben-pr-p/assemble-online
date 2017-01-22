import { Component, h } from 'preact'
import store from 'store'
import Menu from './menu'
import Room from './room'
import Sock from '../lib/sock'
import { Bus } from '../lib/emitters'

export default class Main extends Component {
  state = {
    users: [],
    me: null
  }

  componentWillMount () {
    Sock.on('users', this.handleUsers)
    Bus.on('me', this.handleMe)

    this.state.me = store.get('me')
    if (this.state.me) this.announceMe(this.state.me)
  }

  componentWillUnmount () {
    Sock.off('users', this.handleUsers)
  }

  handleUsers = users => users
    ? this.setState({ users })
    : null

  announceMe = data => Sock.emit('me', data)

  handleMe = me => this.setState({ me })

  clearLocal = () => {
    store.clear()
    this.state.me = null
    this.forceUpdate()
  }

  render (props, { me, users, theme }) {
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
