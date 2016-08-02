import React from 'react'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import AccountBox from 'material-ui/svg-icons/action/account-box'

export default class AppBarIconMenu extends React.Component {
  constructor () {
    super()
  }

  editUser () {
    this.props.setEditUserState(true)
  }

  seeUsers () {
    console.log('TO WRITE')
  }

  render () {
    const { roomName } = this.props

    const style = {
      position: 'fixed'
    }

    return (
      <AppBar
        className='app-bar'
        style={style}
        title={roomName}
        iconElementLeft={
          <IconButton onClick={this.props.clearLocal} >
            <DeleteIcon />
          </IconButton>
        }
        iconElementRight={
          <IconMenu
            iconButtonElement={
              <IconButton>
                <AccountBox />
              </IconButton>
            }
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          >
            <MenuItem primaryText='Edit Me' onClick={this.editUser.bind(this)} />
            <MenuItem primateText='See Users' onClick={this.seeUsers.bind(this)} />
          </IconMenu>
        }
      />
    )
  }
}
