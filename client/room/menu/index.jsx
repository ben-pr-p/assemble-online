import { Component, h } from 'preact'
import Sock from '../../lib/sock'
import BugReport from './bug-report'
import EditUser from './edit-user'
import EditCheckpoint from './edit-checkpoint'
import UserBrowse from './user-browse'
import CheckpointBrowse from './checkpoint-browse'
import IconButton from '../../common/icon-button'
import store from 'store'

import {
  Settings, Person, Bug, Widgets, Close, People, Checkpoint, NewCheckpoint,
  BrowseCheckpoints
} from '../../common/icons'

const RADIUS = 200

export default class Menu extends Component {
  toggleOpen = () =>
    this.setState({open: !this.state.open})

  endBugReport = () =>
    this.setState({bugReport: false})

  wrapSetItems = items => ev =>
    this.setState({ currentItems: items })

  closeModal = params => {
    if (params && params.shouldSave == 'user')
      Sock.emit('me', store.get('me'))

    this.setState({
      editingUser: false,
      newCheckpointForm: false
    })
  }

  wrapAction = action => ev => {
    this.state.currentItems = this.config
    this.state.open = false
    action()
  }

  config = [
    {
      icon: <Person />,
      label: 'Edit Me',
      action: this.wrapAction(() => this.setState({editingUser: true}))
    },
    {
      icon: <Bug />,
      label: 'File a Bug Report',
      action: this.wrapAction(() => this.setState({bugReport: true}))
    },
    {
      icon: <Checkpoint />,
      label: 'Checkpoints',
      children: [
        {
          icon: <NewCheckpoint />,
          label: 'New Checkpoint',
          action: this.wrapAction(() => this.setState({newCheckpointForm: true}))
        },
        {
          icon: <BrowseCheckpoints />,
          label: 'Browse Checkpoints',
          action: this.wrapAction(() => this.setState({checkpointBrowse: true}))
        }
      ]
    },
    {
      icon: <People />,
      label: 'Users',
      action: this.wrapAction(() => this.setState({userBrowse: true}))
    }
  ]

  state = {
    open: false,
    currentItems: this.config,
    bugReport: false,
    editingUser: false,
    checkpointBrowse: false,
    userBrowse: false,
    newCheckpointForm: false
  }

  closeCheckpointBrowse = () => this.setState({checkpointBrowse: false})
  closeUserBrowse = () => this.setState({userBrowse: false})

  render ({me, users, checkpoints}, {
    open, editingUser, bugReport, userBrowse, checkpointBrowse,
    newCheckpointForm
  }) {
    return (
      <div className={`menu`}>
        <IconButton onClick={this.toggleOpen}>
          {open
            ? <Close />
            : <Settings />
          }
        </IconButton>

        {open && this.renderMenu(this.state.currentItems)}

        {userBrowse &&
          <UserBrowse {...{users, close: this.closeUserBrowse}} />}
        {checkpointBrowse &&
          <CheckpointBrowse {...{checkpoints, close: this.closeCheckpointBrowse}} />}
        {newCheckpointForm &&
          <EditCheckpoint {...{closeModal: this.closeModal}} />}
        {bugReport &&
          <BugReport endBugReport={this.endBugReport} />}
        {(!me || editingUser) &&
          <EditUser {...{closeModal: this.closeModal, me}} />}
      </div>
    )
  }

  renderMenu = base => base.map((b, idx) => {
    return (
      <div id={b.label}
        className='menu'
        onClick={b.action && !b.children
          ? b.action
          : this.wrapSetItems(b.children)
        }
        style={{
          transform: this.computeTransform(this.state.currentItems, idx)
        }}
      >
        {b.icon}
        <div className='tooltip'>
          {b.label}
        </div>
      </div>
    )
  })

  computeTransform = (items, idx) => {
    const slopeDiff = Math.PI / (2 * (items.length - 1))
    const angle = items.length > 1
      ? idx * slopeDiff
      : Math.PI / 4

    return `translate(
      ${RADIUS * Math.cos(angle)}px,
      -${RADIUS * Math.sin(angle)}px
    )`
  }

  renderWidget = (me, widget) => Array.isArray(widget)
    ? this._renderWidget(me, widget[0], widget[1])
    : this._renderWidget(me, widget, null)

  _renderWidget = (me, W, initialState) => <W me={me} initialState={initialState} />
}
