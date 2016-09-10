import React from 'react'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import AccountBox from 'material-ui/svg-icons/action/account-box'
import BugIcon from 'material-ui/svg-icons/action/bug-report'
import SettingsIcon from 'material-ui/svg-icons/action/settings'
import ColorIcon from 'material-ui/svg-icons/image/color-lens'
import Paper from 'material-ui/Paper'
import BugReport from '../bug-report/bug-report'
import shallowUpdateCompare from '../../lib/shallow-update-compare'

class AppBar extends React.Component {
  constructor () {
    super()
    this.state = {
      bugreport: false
    }

    this.initializeBugReport = this.initializeBugReport.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return shallowUpdateCompare(this.props, this.state, nextProps, nextState)
  }

  initializeBugReport () {
    this.setState({bugreport: true})
  }

  endBugReport () {
    this.setState({bugreport: false})
  }

  editUser () {
    this.props.setEditUserState(true)
  }

  render () {
    const iconColor = this.context.muiTheme.palette.textColor

    let bugmodal
    if (this.state.bugreport) bugmodal = (<BugReport endBugReport={this.endBugReport.bind(this)} />)

    return (
      <div className='app-bar'>
        <Paper className='floating-button' circle={true} zDepth={5} style={{left: 20, right: 'auto'}} >
          <IconMenu
            iconButtonElement={
              <IconButton className='circle-button' >
                <SettingsIcon />
              </IconButton>
            }
            targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          >
            <MenuItem leftIcon={<AccountBox color={iconColor} />} primaryText='Edit Me' onClick={this.editUser.bind(this)} />
            <MenuItem leftIcon={<BugIcon color={iconColor} />} primaryText='File Bug Report / Feature Request' onClick={this.initializeBugReport} />
            <MenuItem leftIcon={<ColorIcon color={iconColor} />} primaryText='Edit the Color Schema' onClick={this.props.openColorModal} />
          </IconMenu>
        </Paper>

        {bugmodal}
      </div>
    )
  }
}

AppBar.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired
}

export default AppBar
