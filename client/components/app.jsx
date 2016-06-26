import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import UserBlob from './user-blob/user-blob'
import NewUserModal from './new-user-modal/new-user-modal'
import store from 'store'
import io from 'socket.io-client'

export default class App extends React.Component {
  constructor () {
    super()
    this.state = {
      users: [],
      me: null
    }
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

  closeNewUserModal () {
    this.findMe()
    this.announceMe()
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
          <svg id='plaza'>
            {blobs}
          </svg>
          {newUserModal}
        </div>
      </MuiThemeProvider>
    )
  }
}
