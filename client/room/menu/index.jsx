import { Component, h } from 'preact'
import DeleteIcon from '../../common/icons/delete'
import AccountBox from '../../common/icons/account-box'
import BugIcon from '../../common/icons/bug-report'
import SettingsIcon from '../../common/icons/settings'
import ColorIcon from '../../common/icons/color-lens'
import BugReport from './bug-report'
import NewUserModal from './new-user-modal'
import theme from '../../lib/theme-manager'

const colors = ['green', 'yellow', 'red', 'blue'].map(col => theme.get(col))

export default class Menu extends Component {
  state = {
    open: false,
    navPos: 0,
    bugReport: false,
    editingUser: false,
    editingColor: false
  }

  config = [
    {label: 'Edit Me', action: 'editUser'},
    {label: 'File a Bug Report', action: 'initializeBugReport'},
  ]

  toggleOpen = () => this.setState({open: !this.state.open})

  initializeBugReport = () =>
    this.setState({bugReport: true})

  endBugReport = () =>
    this.setState({bugReport: false})

  editUser = () => this.setState({editingUser: true})

  openColorModal = () => this.setState({ editingColor: true })
  closeColorModal = () => this.setState({ editingColor: false })

  closeNewUserModal = params => {
    if (params.shouldSave)
      Boss.post('user/new', store.get('me'))

    this.setState({editingUser: false})
  }

  render ({me}, {open, editingUser, bugReport, editingColor}) {
    return (
      <div className='menu'>
        <div className='menu-bar bottom' onClick={this.toggleOpen}>
          {open ? 'Close' : 'Menu'}
        </div>

        {open && this.renderMenu(this.config, '0')}

        {bugReport && <BugReport endBugReport={this.endBugReport} />}
        { (!me || editingUser) &&
          <NewUserModal {...{closeNewUserModal: this.closeNewUserModal, me}}/>
        }
        { editingColor &&
          <Colors {...{
            setColors: this.setColors,
            palette: theme.getPalette(),
            closeColorModal: this.closeColorModal
          }}/>
        }
      </div>
    )
  }

  renderMenu (bars, idxBase) {
    return bars.map((b, idx) => {
      const data = idxBase + '-' + idx.toString()

      return (
        <div className={`menu-bar ${idx == 0 ? 'bottom' : ''}`}
          data={data}
          onClick={this[b.action]}
          style={{
            left: (data.split('-').length - 1) * 150,
            bottom: idx * 40 + 40
          }}
        >
          {b.label}
          {((idxBase || '') + idx.toString()) == this.state.navPos && this.renderMenu(b.children || [])}
        </div>
      )
    })
  }
}
