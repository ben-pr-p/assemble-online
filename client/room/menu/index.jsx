import { Component, h } from 'preact'
import BugReport from './bug-report'
import NewUserModal from './new-user-modal'
import theme from '../../lib/theme-manager'
import Sock from '../../lib/sock'
import { Settings, Person, Bug, Widgets, Close } from '../../common/icons'
import IconButton from '../../common/icon-button'
import { FromPeers } from '../../lib/emitters'
import allWidgets from '../widgets'
import store from 'store'
import wildcardify from 'wildcards'

export default class Menu extends Component {
  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  initializeBugReport = () =>
    this.setState({bugReport: true})

  endBugReport = () =>
    this.setState({bugReport: false})

  wrapSetItems = items => ev => {
    this.setState({ currentItems: items })
  }

  editUser = () => this.setState({editingUser: true})
  openColorModal = () => this.setState({ editingColor: true })
  closeColorModal = () => this.setState({ editingColor: false })

  closeNewUserModal = params => {
    if (params.shouldSave)
      Sock.emit('me', store.get('me'))

    this.setState({editingUser: false})
  }

  wrapAddWidget = widget => ev =>
    this.setState({ widgets: this.state.widgets.concat([widget]) })

  wrapAction = action => ev => {
    this.state.currentItems = this.config
    this.state.open = false
    action()
  }

  config = [
    {
      icon: <Person />,
      label: 'Edit Me',
      action: this.wrapAction(this.editUser)
    },
    {
      icon: <Bug />,
      label: 'File a Bug Report',
      action: this.wrapAction(this.initializeBugReport)
    },
    {
      icon: <Widgets />,
      label: 'Widgets',
      children: allWidgets.map(w => ({
        label: w.kind,
        icon: w.icon,
        action: this.wrapAction(this.wrapAddWidget(w))
      }))
    }
  ]

  state = {
    open: false,
    currentItems: this.config,
    bugReport: false,
    editingUser: false,
    editingColor: false,
    widgets: []
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

  render ({me}, {open, editingUser, bugReport, editingColor, widgets}) {
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
        {widgets.map(w => this.renderWidget(me, w))}
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
      ${100 * Math.cos(angle)}px,
      -${100 * Math.sin(angle)}px
    )`
  }

  renderWidget = (me, widget) => Array.isArray(widget)
    ? this._renderWidget(me, widget[0], widget[1])
    : this._renderWidget(me, widget, null)

  _renderWidget = (me, W, initialState) => <W me={me} initialState={initialState} />
}
