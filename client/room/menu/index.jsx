import { Component, h } from 'preact'
import Sock from '../../lib/sock'
import BugReport from './bug-report'
import EditUser from './edit-user'
import UserBrowse from './user-browse'
import CheckpointBrowse from './checkpoint-browse'
import IconButton from '../../common/icon-button'
import { FromPeers } from '../../lib/emitters'
import store from 'store'
import wildcardify from 'wildcards'

import {
  Settings, Person, Bug, Widgets, Close, People, Checkpoint
} from '../../common/icons'

const RADIUS = 200

export default class Menu extends Component {
  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  endBugReport = () =>
    this.setState({bugReport: false})

  wrapSetItems = items => ev => {
    this.setState({ currentItems: items })
  }

  closeNewUserModal = params => {
    if (params.shouldSave)
      Sock.emit('me', store.get('me'))

    this.setState({editingUser: false})
  }
  //
  // wrapAddWidget = widget => ev =>
  //   this.setState({ widgets: this.state.widgets.concat([widget]) })
  //
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
      action: this.wrapAction(() => this.setState({checkpointBrowse: true}))
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
  }

  componentWillMount () {
    wildcardify(FromPeers, '*', (ev, data) => {
      /*
       * If we currently don't have a widget listener for the event,
       *  - create the proper widget, give it 10 ms to mount, and then re-broadcast
       *    this event
       */
      if (FromPeers.listeners(ev).length == 0) {
        this.setState({
          widgets: this.state.widgets.concat(allWidgets.filter(w => w.kind == ev.split('-')[1]).map(w => [w, data]))
        })
        setTimeout(() => FromPeers.emit(ev, data), 10)
      }
    })
  }

  render ({me}, {
    open, editingUser, bugReport, userBrowse, checkpointBrowse
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
        {/* Actual menu modals that can pop up */}
        {bugReport &&
          <BugReport endBugReport={this.endBugReport} />}
        {(!me || editingUser) &&
          <NewUserModal {...{closeNewUserModal: this.closeNewUserModal, me}} />}
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
