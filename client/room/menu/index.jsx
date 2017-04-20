import React, { Component } from 'react'
import { Menu, Button, Tooltip } from 'antd'
import Sock from '../../lib/sock'
import BugReport from './bug-report'
import EditUser from './edit-user'
import EditCheckpoint from './edit-checkpoint'
import UserBrowse from './user-browse'
import CheckpointBrowse from './checkpoint-browse'
import store from 'store'
import {
  Settings, Person, Bug, Widgets, Close, People, Checkpoint, NewCheckpoint,
  BrowseCheckpoints
} from '../../common/icons'

const { SubMenu, MenuItemGroup } = Menu

export default class MainMenu extends Component {
  config = {
    'File a Bug Report': {
      icon: Bug,
      Component: BugReport
    },
    'New Checkpoint': {
      icon: NewCheckpoint,
      Component: EditCheckpoint
    },
    'Browse Checkpoints': {
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
    }
  }

  state = {
    selected: null
  }

  close = (params) => this.setState(
    params && params.save
      ? { selected: null, me: params.save }
      : { selected: null }
  )

  allClicks = e => this.setState({ selected: e.key })

  render () {
    const { me, users, checkpoints } = this.props
    const { selected } = this.state

    const attrs = { me, users, checkpoints, close: this.close }

    return (
      <div className='menu-container'>
        <Menu className='menu' theme='dark' mode='horizontal' onClick={this.allClicks}
          selectedKeys={[selected]}
        >
          {Object.keys(this.config).map(key => (
            <Menu.Item className='menu-item-antd' key={key} >
              <Tooltip placement='top' title={key}>
                <div className='menu-item'>
                  {this.renderComponent(this.config[key].icon)}
                  <span> {key} </span>
                </div>
              </Tooltip>
            </Menu.Item>
          ))}
        </Menu>

        {!me && <EditUser {...attrs} />}
        {me && selected && this.renderComponent(this.config[selected].Component, attrs)}
      </div>
    )
  }

  renderComponent = (Component, attrs) => {
    return <Component {...attrs} />
  }
}
