import React, { Component } from 'react'
import { Menu, Button, Tooltip } from 'antd'
import shallowCompare from 'shallow-compare'
import store from 'store'
import Sock from '../../lib/sock'
import Broadcasting from './broadcasting'
import BugReport from './bug-report'
import CheckpointBrowse from './checkpoint-browse'
import EditUser from './edit-user'
import EditCheckpoint from './edit-checkpoint'
import UserBrowse from './user-browse'
import {
  Broadcast,
  BrowseCheckpoints,
  Bug,
  Checkpoint,
  Close,
  NewCheckpoint,
  People,
  Person,
  Settings,
  Widgets
} from '../../common/icons'

const { SubMenu, MenuItemGroup } = Menu

export default class MainMenu extends Component {
  config = {
    'File a Bug Report': {
      icon: Bug,
      Component: BugReport
    },
    'New Group': {
      icon: NewCheckpoint,
      Component: EditCheckpoint
    },
    'Browse Groups': {
      icon: BrowseCheckpoints,
      Component: CheckpointBrowse
    },
    'Edit Me': {
      icon: Person,
      Component: EditUser
    },
    'Browse Users': {
      icon: People,
      Component: UserBrowse
    },
    Broadcast: {
      icon: Broadcast,
      Component: Broadcasting.Sending
    }
  }

  state = {
    selected: null,
    receivingBroadcast: false
  }

  componentDidMount() {
    Sock.on(
      'broadcasting',
      user =>
        user.id != Sock.id ? this.setState({ receivingBroadcast: user }) : null
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  close = params =>
    this.setState(
      params && params.save
        ? { selected: null, me: params.save }
        : { selected: null }
    )

  allClicks = e => this.setState({ selected: e.key })

  render() {
    const { me, users, checkpoints } = this.props
    const { selected, receivingBroadcast } = this.state

    const attrs = { me, users, checkpoints, close: this.close }

    return (
      <div className="menu-container">
        <Menu
          className="menu"
          theme="dark"
          mode="horizontal"
          onClick={this.allClicks}
          selectedKeys={[selected]}
        >
          {Object.keys(this.config).map(key => (
            <Menu.Item className="menu-item-antd" key={key}>
              <Tooltip placement="top" title={key}>
                <div className="menu-item">
                  {this.renderComponent(this.config[key].icon)}
                  <span> {key} </span>
                </div>
              </Tooltip>
            </Menu.Item>
          ))}
        </Menu>

        {!me && <EditUser {...attrs} />}
        {me &&
          !receivingBroadcast &&
          selected &&
          this.renderComponent(this.config[selected].Component, attrs)}

        {receivingBroadcast &&
          <Broadcasting.Receiving broadcasting={receivingBroadcast} />}
      </div>
    )
  }

  renderComponent = (Component, attrs) => {
    return <Component {...attrs} />
  }
}
