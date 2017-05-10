import React, { Component } from 'react'
import store from 'store'
import shallowCompare from 'shallow-compare'
import Menu from './menu'
import Room from './room'
import CheckpointDrawer from './checkpoint-drawer'
import Sock from '../lib/sock'
import Updates from '../lib/updates'
import { Bus } from '../lib/emitters'

export default class Main extends Component {
  state = {
    users: [],
    checkpoints: [],
    me: null
  }

  componentWillMount() {
    Sock.on('users', this.handleUsers)
    Sock.on('checkpoints', this.handleCheckpoints)

    this.state.me = store.get('me')

    if (this.state.me) {
      Object.assign(this.state.me, { audio: true, video: false })
      store.set('me', this.state.me)
      this.announceMe(this.state.me)
    }
  }

  componentWillUnmount() {
    Sock.off('users', this.handleUsers)
    Sock.off('checkpoints', this.handleCheckpoints)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  handleUsers = users => {
    if (users) {
      const me = users.filter(u => u.id == Sock.id)[0]
      this.setState({ users, me })
    }
  }

  handleCheckpoints = checkpoints => {
    if (checkpoints) {
      this.setState({ checkpoints })
    }
  }

  announceMe = data => Sock.emit('me', data)

  clearLocal = () => {
    store.clear()
    this.state.me = null
    this.forceUpdate()
  }

  render() {
    const { me, users, checkpoints } = this.state

    const { clearLocal } = this
    const cp = checkpoints.filter(c => c.members.includes(Sock.id))[0]

    if (cp) Updates.emit('cp-on')
    if (!cp) Updates.emit('cp-off')

    return (
      <div
        id="main-app"
        style={{
          width: cp ? '60%' : '100%',
        }}
      >
        {me && <Room {...{ me, users, checkpoints }} />}
        {cp && <CheckpointDrawer me={me} checkpoint={cp} />}
        <Menu {...{ me, users, checkpoints, clearLocal }} />
      </div>
    )
  }
}
