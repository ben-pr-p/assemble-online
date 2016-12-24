import { Component, h } from 'preact'
import BugReport from './bug-report'
import NewUserModal from './new-user-modal'
import theme from '../../lib/theme-manager'
import Boss from '../../lib/boss'
import { FromPeers } from '../../lib/emitters'
import allWidgets from '../widgets'
import store from 'store'
import wildcardify from 'wildcards'

const colors = ['green', 'yellow', 'red', 'blue'].map(col => theme.get(col))

export default class Menu extends Component {
  state = {
    open: false,
    navPos: 0,
    bugReport: false,
    editingUser: false,
    editingColor: false,
    widgets: []
  }

  componentWillMount () {
    wildcardify(FromPeers, '*', (ev, data) => {
      if (FromPeers.listeners(ev).length == 0) {
        this.setState({
          widgets: this.state.widgets.concat(allWidgets.filter(w => w.kind == ev.split('-')[1]).map(w => [w, data]))
        })
        setTimeout(() => FromPeers.emit(ev, data), 10)
      }
    })
  }

  toggleOpen = () => this.setState({open: !this.state.open})

  initializeBugReport = () =>
    this.setState({bugReport: true})

  endBugReport = () =>
    this.setState({bugReport: false})

  wrapNavPos = navPos => ev => this.setState({ navPos })

  wrapAddWidget = widget => ev =>
    this.setState({ widgets: this.state.widgets.concat([widget]) })

  editUser = () => this.setState({editingUser: true})

  openColorModal = () => this.setState({ editingColor: true })
  closeColorModal = () => this.setState({ editingColor: false })

  closeNewUserModal = params => {
    if (params.shouldSave)
      Boss.post('user/new', store.get('me'))

    this.setState({editingUser: false})
  }

  config = [
    {label: 'Edit Me', action: this.editUser},
    {label: 'File a Bug Report', action: this.initializeBugReport},
    {label: 'Widgets', children: allWidgets.map(w => {
      return {
        label: w.kind,
        action: this.wrapAddWidget(w)
      }})
    }
  ]

  render ({me}, {open, editingUser, bugReport, editingColor, widgets}) {
    return (
      <div className='menu'>

        {widgets.map(w => this.renderWidget(me, w))}

        <div className='menu-bar bottom' onClick={this.toggleOpen}>
          {open ? 'Close' : 'Menu'}
        </div>

        {open && this.renderMenu(this.config, '0')}

        {bugReport && <BugReport endBugReport={this.endBugReport} />}

        {this.renderNewUserModal(me, editingUser)}
      </div>
    )
  }

  renderMenu = (bars, idxBase) => bars.map((b, idx) => {
    const data = idxBase + '-' + idx.toString()
    return (
      <div id={b.label}
        className={`menu-bar ${idx == 0 ? 'bottom' : ''}`}
        data={data}
        onClick={b.action && !b.children
          ? b.action
          : this.wrapNavPos(data)
        }
        style={{
          transform: `translate(
            ${(data.split('-').length - 1) * 150}px,
            -${idx * 40 + 40}px
          )`
        }}
      >
        {b.label}
        {data == this.state.navPos && this.renderMenu(b.children || [], (parseInt(idxBase) + 1).toString())}
      </div>
    )
  })

  renderWidget = (me, widget) => Array.isArray(widget)
    ? this._renderWidget(me, widget[0], widget[1])
    : this._renderWidget(me, widget, null)

  _renderWidget = (me, W, initialState) => <W me={me} initialState={initialState} />

  renderNewUserModal = (me, editingUser) => (!me || editingUser)
    ? <NewUserModal {...{closeNewUserModal: this.closeNewUserModal, me}} />
    : null
}
