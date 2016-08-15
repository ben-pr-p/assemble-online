import React from 'react'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import AccountBox from 'material-ui/svg-icons/action/account-box'
import BugIcon from 'material-ui/svg-icons/action/bug-report'
import Paper from 'material-ui/Paper'
import BugReport from '../bug-report/bug-report'

export default class AppBar extends React.Component {
  constructor () {
    super()
    this.state = {
      bugreport: false
    }
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

  seeUsers () {
    console.log('TO WRITE')
  }

  render () {
    let bugmodal
    if (this.state.bugreport) bugmodal = (<BugReport endBugReport={this.endBugReport.bind(this)} />)

    return (
      <div className='app-bar'>
        <Paper className='floating-button' circle={true} zDepth={5} style={{left: 'auto', right: 20}} >
          <IconMenu
            iconButtonElement={
              <IconButton className='circle-button' >
                <AccountBox />
              </IconButton>
            }
            targetOrigin={{horizontal: 'right', vertical: 'bottom'}}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          >
            <MenuItem primaryText='Edit Me' onClick={this.editUser.bind(this)} />
            <MenuItem primateText='See Users' onClick={this.seeUsers.bind(this)} />
          </IconMenu>
        </Paper>

        <Paper className='floating-button' circle={true} zDepth={5} style={{left: 20, right: 'auto'}} >
          <IconButton onClick={this.props.clearLocal} className='circle-button'  >
            <DeleteIcon />
          </IconButton>
        </Paper>

        <Paper className='floating-button' circle={true} zDepth={5} style={{left: 90, right: 'auto'}} >
          <IconButton onClick={this.initializeBugReport.bind(this)} className='circle-button'  >
            <BugIcon />
          </IconButton>
        </Paper>

        {bugmodal}
      </div>
    )
  }
}
